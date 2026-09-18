import math
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

# Regression Models
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Classification Models
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score

from backend.app.schemas.api_schemas import (
    MLTaskDetectionResponse, MLTrainRequest, MLTrainResponse, MLModelResult,
    MLPredictRequest, MLPredictResponse, ClusteringRequest, ClusteringResponse, ClusterProfile
)
from backend.app.services.profiling_service import sanitize_float

TRAINED_MODELS_CACHE: Dict[str, Dict[str, Any]] = {}

def detect_ml_task(df: pd.DataFrame) -> MLTaskDetectionResponse:
    """Analyze dataset structure to recommend ML problem type and target columns."""
    target_candidates = []
    feature_candidates = []
    
    suggested_task = "clustering"
    best_target = None
    
    for col in df.columns:
        series = df[col].dropna()
        if series.empty:
            continue
        unique_cnt = series.nunique()
        dtype_str = str(series.dtype)
        
        if unique_cnt == len(df) or "id" in str(col).lower() or "name" in str(col).lower() or "key" in str(col).lower():
            continue
            
        feature_candidates.append(str(col))
        
        col_lower = str(col).lower()
        is_target_keyword = any(k in col_lower for k in ["target", "label", "churn", "price", "sales", "profit", "disease", "class", "status", "risk", "rating", "score", "total"])
        
        if pd.api.types.is_numeric_dtype(series):
            if unique_cnt == 2:
                target_candidates.append({
                    "column": str(col),
                    "type": "binary_classification",
                    "unique_values": int(unique_cnt),
                    "confidence": 0.95 if is_target_keyword else 0.8
                })
            elif unique_cnt > 15:
                target_candidates.append({
                    "column": str(col),
                    "type": "regression",
                    "unique_values": int(unique_cnt),
                    "confidence": 0.92 if is_target_keyword else 0.75
                })
            else:
                target_candidates.append({
                    "column": str(col),
                    "type": "multiclass_classification",
                    "unique_values": int(unique_cnt),
                    "confidence": 0.85 if is_target_keyword else 0.7
                })
        else:
            if unique_cnt <= 10:
                target_candidates.append({
                    "column": str(col),
                    "type": "classification",
                    "unique_values": int(unique_cnt),
                    "confidence": 0.90 if is_target_keyword else 0.7
                })

    target_candidates.sort(key=lambda x: x["confidence"], reverse=True)
    
    if target_candidates:
        top_cand = target_candidates[0]
        suggested_task = "regression" if top_cand["type"] == "regression" else "classification"
        best_target = top_cand["column"]
        reason = f"Identified '{best_target}' as optimal target variable for {suggested_task.upper()} ({top_cand['unique_values']} distinct values)."
    else:
        suggested_task = "clustering"
        reason = "No obvious target variable detected. Unsupervised clustering is recommended."
        
    return MLTaskDetectionResponse(
        suggested_task=suggested_task,
        target_column_candidates=target_candidates,
        feature_candidates=feature_candidates,
        reason=reason
    )

def prepare_data_pipeline(df: pd.DataFrame, feature_cols: List[str], target_col: Optional[str] = None):
    """Clean, encode and scale features safely."""
    X = df[feature_cols].copy()
    y = df[target_col].copy() if target_col and target_col in df.columns else None
    
    num_cols = [c for c in feature_cols if pd.api.types.is_numeric_dtype(X[c])]
    cat_cols = [c for c in feature_cols if c not in num_cols]
    
    for c in num_cols:
        if X[c].isna().sum() > 0:
            X[c] = X[c].fillna(X[c].median() if len(X[c].dropna()) > 0 else 0)
    for c in cat_cols:
        X[c] = X[c].astype(str).fillna("Missing")
        
    transformers = []
    if num_cols:
        transformers.append(("num", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ]), num_cols))
    if cat_cols:
        transformers.append(("cat", Pipeline([
            ("imputer", SimpleImputer(strategy="constant", fill_value="Missing")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        ]), cat_cols))
        
    preprocessor = ColumnTransformer(transformers=transformers, remainder="drop")
    X_processed = preprocessor.fit_transform(X)
    
    encoded_feature_names = []
    if num_cols:
        encoded_feature_names.extend(num_cols)
    if cat_cols:
        try:
            onehot_obj = preprocessor.named_transformers_["cat"].named_steps["onehot"]
            onehot_names = onehot_obj.get_feature_names_out(cat_cols)
            encoded_feature_names.extend(onehot_names)
        except Exception:
            for c in cat_cols:
                encoded_feature_names.append(c)
                
    label_encoder = None
    y_processed = None
    
    if y is not None:
        valid_mask = ~y.isna()
        X_processed = X_processed[valid_mask]
        y = y[valid_mask]
        
        if not pd.api.types.is_numeric_dtype(y):
            label_encoder = LabelEncoder()
            y_processed = label_encoder.fit_transform(y.astype(str))
        else:
            y_processed = y.values
            
    return X_processed, y_processed, preprocessor, label_encoder, encoded_feature_names

def train_ml_models(df: pd.DataFrame, req: MLTrainRequest, dataset_id: int) -> MLTrainResponse:
    """Train multiple regression or classification models and return comparative benchmark results."""
    task_type = req.task_type.lower()
    target_col = req.target_col
    feature_cols = req.feature_cols
    
    if not target_col or target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset.")
        
    X_proc, y_proc, preprocessor, label_encoder, encoded_feature_names = prepare_data_pipeline(df, feature_cols, target_col)
    
    if len(X_proc) < 10:
        raise ValueError("Dataset has too few records for reliable machine learning training (minimum 10 rows).")
        
    stratify = y_proc if (task_type == "classification" and len(np.unique(y_proc)) > 1 and min(pd.Series(y_proc).value_counts()) >= 2) else None
    X_train, X_test, y_train, y_test = train_test_split(
        X_proc, y_proc, test_size=req.test_size, random_state=req.random_state, stratify=stratify
    )
    
    model_results: List[MLModelResult] = []
    best_score = -999999.0
    best_model_name = ""
    
    if task_type == "regression":
        candidate_models = {
            "Linear Regression": LinearRegression(),
            "Decision Tree Regressor": DecisionTreeRegressor(max_depth=6, random_state=req.random_state),
            "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=8, random_state=req.random_state),
            "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=req.random_state)
        }
        
        for name, model in candidate_models.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            
            mae = float(mean_absolute_error(y_test, y_pred))
            mse = float(mean_squared_error(y_test, y_pred))
            rmse = float(np.sqrt(mse))
            r2 = float(r2_score(y_test, y_pred))
            
            feat_imp = {}
            if hasattr(model, "feature_importances_"):
                importances = model.feature_importances_
                for fname, imp in zip(encoded_feature_names[:len(importances)], importances):
                    feat_imp[fname] = round(float(imp), 4)
            elif hasattr(model, "coef_"):
                coefs = np.abs(model.coef_)
                sum_coef = max(1e-5, np.sum(coefs))
                for fname, c in zip(encoded_feature_names[:len(coefs)], coefs):
                    feat_imp[fname] = round(float(c / sum_coef), 4)
                    
            feat_imp = dict(sorted(feat_imp.items(), key=lambda x: x[1], reverse=True)[:10])
            
            n_sample = min(40, len(y_test))
            actual_vs_pred = [
                {"index": int(i), "actual": round(float(y_test[i]), 2), "predicted": round(float(y_pred[i]), 2)}
                for i in range(n_sample)
            ]
            
            is_best = r2 > best_score
            if is_best:
                best_score = r2
                best_model_name = name
                
            model_results.append(MLModelResult(
                model_name=name,
                task_type="regression",
                metrics={
                    "r2_score": sanitize_float(r2),
                    "rmse": sanitize_float(rmse),
                    "mae": sanitize_float(mae),
                    "mse": sanitize_float(mse),
                    "train_score": sanitize_float(model.score(X_train, y_train))
                },
                feature_importances=feat_imp,
                actual_vs_predicted=actual_vs_pred,
                is_best=False,
                ai_explanation=f"{name} achieves an R² score of {r2:.3f} explaining {max(0.0, r2*100):.1f}% of target variance with RMSE {rmse:.2f}."
            ))
            
            cache_key = f"{dataset_id}_{name}"
            TRAINED_MODELS_CACHE[cache_key] = {
                "model": model,
                "preprocessor": preprocessor,
                "label_encoder": label_encoder,
                "feature_cols": feature_cols,
                "task_type": "regression"
            }

    else: # Classification
        candidate_models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=req.random_state),
            "Decision Tree Classifier": DecisionTreeClassifier(max_depth=6, random_state=req.random_state),
            "Random Forest Classifier": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=req.random_state),
            "Gradient Boosting Classifier": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=req.random_state)
        }
        
        classes = np.unique(y_proc)
        class_labels = [str(c) for c in classes] if label_encoder is None else [str(c) for c in label_encoder.classes_]
        
        for name, model in candidate_models.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            
            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
            rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
            f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
            
            cm = confusion_matrix(y_test, y_pred).tolist()
            
            roc_auc = None
            try:
                if len(classes) == 2 and hasattr(model, "predict_proba"):
                    roc_auc = float(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]))
            except Exception:
                pass
                
            feat_imp = {}
            if hasattr(model, "feature_importances_"):
                importances = model.feature_importances_
                for fname, imp in zip(encoded_feature_names[:len(importances)], importances):
                    feat_imp[fname] = round(float(imp), 4)
            elif hasattr(model, "coef_"):
                coefs = np.abs(model.coef_[0] if len(model.coef_.shape) > 1 else model.coef_)
                sum_coef = max(1e-5, np.sum(coefs))
                for fname, c in zip(encoded_feature_names[:len(coefs)], coefs):
                    feat_imp[fname] = round(float(c / sum_coef), 4)
                    
            feat_imp = dict(sorted(feat_imp.items(), key=lambda x: x[1], reverse=True)[:10])
            
            is_best = f1 > best_score
            if is_best:
                best_score = f1
                best_model_name = name
                
            model_results.append(MLModelResult(
                model_name=name,
                task_type="classification",
                metrics={
                    "accuracy": sanitize_float(acc),
                    "precision": sanitize_float(prec),
                    "recall": sanitize_float(rec),
                    "f1_score": sanitize_float(f1),
                    "roc_auc": sanitize_float(roc_auc)
                },
                feature_importances=feat_imp,
                confusion_matrix=cm,
                class_labels=class_labels,
                is_best=False,
                ai_explanation=f"{name} achieves {acc*100:.1f}% accuracy with an F1 score of {f1:.3f} across {len(class_labels)} classes."
            ))
            
            cache_key = f"{dataset_id}_{name}"
            TRAINED_MODELS_CACHE[cache_key] = {
                "model": model,
                "preprocessor": preprocessor,
                "label_encoder": label_encoder,
                "feature_cols": feature_cols,
                "class_labels": class_labels,
                "task_type": "classification"
            }

    for res in model_results:
        if res.model_name == best_model_name:
            res.is_best = True

    recommendation = (
        f"The best performing architecture is '{best_model_name}' with superior generalization metrics. "
        f"Recommended for production deployment and simulation."
    )

    return MLTrainResponse(
        dataset_id=dataset_id,
        task_type=task_type,
        target_col=target_col,
        features_used=feature_cols,
        trained_models=model_results,
        best_model_name=best_model_name,
        recommendation=recommendation
    )

def predict_single_sample(req: MLPredictRequest) -> MLPredictResponse:
    """Predict target and return AI explanation using trained cached model."""
    cache_key = f"{req.dataset_id}_{req.model_name}"
    cached = TRAINED_MODELS_CACHE.get(cache_key)
    
    if not cached:
        raise ValueError(f"Trained model '{req.model_name}' for dataset {req.dataset_id} is not in active memory. Please train the model first.")
        
    model = cached["model"]
    preprocessor = cached["preprocessor"]
    label_encoder = cached.get("label_encoder")
    feature_cols = cached["feature_cols"]
    task_type = cached["task_type"]
    class_labels = cached.get("class_labels", [])
    
    input_data = {}
    for col in feature_cols:
        input_data[col] = [req.features.get(col, 0)]
    input_df = pd.DataFrame(input_data)
    
    X_input = preprocessor.transform(input_df)
    raw_pred = model.predict(X_input)[0]
    
    probabilities = None
    confidence = "High"
    
    if task_type == "classification":
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_input)[0]
            probabilities = {lbl: round(float(p), 4) for lbl, p in zip(class_labels, probs)}
            max_prob = max(probs)
            confidence = "High" if max_prob >= 0.8 else "Moderate" if max_prob >= 0.6 else "Low"
            
        if label_encoder is not None:
            pred_val = label_encoder.inverse_transform([int(raw_pred)])[0]
        else:
            pred_val = class_labels[int(raw_pred)] if int(raw_pred) < len(class_labels) else str(raw_pred)
            
        ai_exp = f"Model predicts '{pred_val}' with {confidence} confidence."
        if probabilities:
            ai_exp += f" Prediction probability is {probabilities.get(str(pred_val), 0)*100:.1f}%."
    else:
        pred_val = round(float(raw_pred), 2)
        ai_exp = f"Model predicts continuous value of {pred_val:,.2f} based on the supplied feature combination."

    factors = []
    for col in feature_cols[:5]:
        factors.append({"feature": col, "value": req.features.get(col, "N/A"), "impact": "Significant"})

    return MLPredictResponse(
        prediction=pred_val,
        probabilities=probabilities,
        ai_explanation=ai_exp,
        confidence_level=confidence,
        contributing_factors=factors
    )

def perform_kmeans_clustering(df: pd.DataFrame, req: ClusteringRequest) -> ClusteringResponse:
    """Run K-Means clustering, calculate elbow curve, 2D PCA coordinates, and cluster descriptions."""
    features = req.feature_cols
    num_df = df[features].select_dtypes(include=[np.number]).dropna()
    
    if num_df.empty or len(num_df) < 5:
        raise ValueError("Clustering requires numerical features with at least 5 valid records.")
        
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(num_df)
    
    elbow_data = []
    max_k = min(8, len(num_df) - 1)
    for k in range(2, max_k + 1):
        km = KMeans(n_clusters=k, random_state=42, n_init="auto")
        km.fit(X_scaled)
        elbow_data.append({"k": k, "inertia": round(float(km.inertia_), 2)})
        
    k_final = min(req.n_clusters, len(num_df))
    kmeans = KMeans(n_clusters=k_final, random_state=42, n_init="auto")
    labels = kmeans.fit_predict(X_scaled)
    
    pca = PCA(n_components=2)
    pca_coords = pca.fit_transform(X_scaled)
    
    scatter_data = []
    n_samples = min(250, len(pca_coords))
    for i in range(n_samples):
        scatter_data.append({
            "x": round(float(pca_coords[i, 0]), 3),
            "y": round(float(pca_coords[i, 1]), 3),
            "cluster": int(labels[i])
        })
        
    num_df["cluster"] = labels
    clusters_list = []
    total_len = len(num_df)
    
    for c_id in range(k_final):
        c_sub = num_df[num_df["cluster"] == c_id]
        c_size = len(c_sub)
        c_pct = round((c_size / total_len) * 100, 1)
        
        means = {}
        for col in features:
            if col in c_sub.columns:
                means[col] = round(float(c_sub[col].mean()), 2)
                
        highest_feat = max(means.items(), key=lambda x: x[1])[0] if means else "Attributes"
        desc = f"Cluster {c_id + 1} represents {c_pct}% of the cohort characterized by above-average {highest_feat}."
        
        clusters_list.append(ClusterProfile(
            cluster_id=c_id,
            cluster_name=f"Cluster {c_id + 1} ({highest_feat} Focus)",
            size=c_size,
            percentage=c_pct,
            feature_means=means,
            ai_description=desc
        ))
        
    return ClusteringResponse(
        n_clusters=k_final,
        features_used=features,
        elbow_data=elbow_data,
        clusters=clusters_list,
        pca_coordinates=scatter_data
    )
