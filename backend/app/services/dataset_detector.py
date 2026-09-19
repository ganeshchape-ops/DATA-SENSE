import re
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

def normalize_col(name: str) -> str:
    """Normalize column name for robust pattern matching without modifying original column."""
    s = str(name).strip().lower()
    s = re.sub(r'[\s_\-\.\/\\]+', '_', s)
    return s

DOMAIN_SIGNATURES = {
    "student": {
        "name": "Student & Education Performance",
        "filename_keywords": ["student", "education", "result", "exam", "marks", "academic", "school", "grade"],
        "primary_keywords": [
            "math", "maths", "mathematics", "science", "english", "computer", "physics", "chemistry",
            "biology", "history", "geography", "social", "art", "hindi", "language", "subject",
            "student_id", "roll_no", "roll_number", "roll", "reg_no", "marks", "grade", "score",
            "attendance", "attendance_pct", "gpa", "cgpa", "exam", "division", "academic"
        ],
        "combination_rules": [
            {"subjects_count": 2, "weight": 0.45},
            {"has_id": ["student_id", "roll", "reg_no", "student_name"], "weight": 0.25},
            {"has_marks_attendance": ["attendance", "marks", "score", "grade"], "weight": 0.25}
        ]
    },
    "ecommerce": {
        "name": "E-Commerce & Retail Sales",
        "filename_keywords": ["ecommerce", "e_commerce", "sales", "retail", "store", "order", "product", "shop", "transaction"],
        "primary_keywords": [
            "product", "product_name", "category", "sub_category", "price", "unit_price",
            "quantity", "qty", "revenue", "sales", "sales_amount", "total_sales", "profit",
            "net_profit", "discount", "rating", "customer", "customer_id", "order_id",
            "order_date", "shipping", "sku", "item_name", "cart"
        ],
        "combination_rules": [
            {"has_product_cat": ["product", "category", "item", "sku"], "weight": 0.35},
            {"has_financials": ["revenue", "sales", "price", "profit", "discount"], "weight": 0.35},
            {"has_order_customer": ["order_id", "customer_id", "quantity", "rating"], "weight": 0.25}
        ]
    },
    "hr": {
        "name": "HR & Workforce Analytics",
        "filename_keywords": ["employee", "emp", "hr", "workforce", "staff", "payroll", "attrition", "salary"],
        "primary_keywords": [
            "employee_id", "emp_id", "staff_id", "department", "dept", "salary", "compensation",
            "wage", "experience", "exp", "years_at_company", "performance", "appraisal", "rating",
            "attrition", "turnover", "left_company", "satisfaction", "job_satisfaction", "age",
            "joining_date", "hire_date", "role", "designation", "tenure"
        ],
        "combination_rules": [
            {"has_emp_dept": ["employee_id", "emp_id", "department", "dept", "designation"], "weight": 0.40},
            {"has_comp_exp": ["salary", "compensation", "experience", "tenure", "years"], "weight": 0.35},
            {"has_hr_metrics": ["attrition", "performance", "satisfaction", "joining_date"], "weight": 0.25}
        ]
    },
    "banking": {
        "name": "Banking & Credit Risk Analytics",
        "filename_keywords": ["banking", "bank", "credit", "loan", "risk", "cibil", "fico", "delinquent", "default"],
        "primary_keywords": [
            "credit_score", "credit", "cibil", "fico", "balance", "account_balance", "account_no",
            "customer_id", "client_id", "income", "annual_income", "salary", "loan", "loan_amount",
            "credit_limit", "default", "is_default", "delinquent", "bad_loan", "interest",
            "deposits", "transactions"
        ],
        "combination_rules": [
            {"has_credit_balance": ["credit_score", "balance", "account_balance", "deposit"], "weight": 0.40},
            {"has_income_loan": ["income", "loan", "credit_limit", "borrowing"], "weight": 0.35},
            {"has_risk_id": ["customer_id", "default", "delinquent", "cibil"], "weight": 0.25}
        ]
    },
    "finance": {
        "name": "Corporate Finance & Accounting",
        "filename_keywords": ["finance", "financial", "accounting", "pnl", "ledger", "balance_sheet", "ebitda", "opex"],
        "primary_keywords": [
            "revenue", "gross_revenue", "expense", "expenses", "opex", "cogs", "cost", "profit",
            "net_profit", "net_income", "ebitda", "operating_profit", "assets", "liabilities",
            "debt", "cash_flow", "solvency", "roi", "account", "entity", "cost_center", "fiscal"
        ],
        "combination_rules": [
            {"has_rev_exp": ["revenue", "expense", "expenses", "cost", "opex"], "weight": 0.45},
            {"has_balance_sheet": ["assets", "liabilities", "debt", "cash_flow", "ebitda"], "weight": 0.40}
        ]
    },
    "marketing": {
        "name": "Marketing & Campaign Analytics",
        "filename_keywords": ["marketing", "campaign", "ad", "ads", "advertising", "conversion", "traffic", "leads"],
        "primary_keywords": [
            "campaign", "campaign_name", "ad_name", "ad_group", "impressions", "clicks", "ctr",
            "conversions", "conversion_rate", "cvr", "cpc", "cpa", "roas", "ad_spend", "spend",
            "channel", "source", "medium", "traffic_source"
        ],
        "combination_rules": [
            {"has_campaign_channel": ["campaign", "channel", "medium", "ad_group"], "weight": 0.35},
            {"has_funnel_metrics": ["impressions", "clicks", "conversions", "ctr"], "weight": 0.45},
            {"has_spend_roas": ["spend", "cost", "cpc", "roas", "cpa"], "weight": 0.20}
        ]
    },
    "healthcare": {
        "name": "Healthcare & Clinical Population Analytics",
        "filename_keywords": ["health", "healthcare", "patient", "clinical", "hospital", "medical", "disease", "diagnosis"],
        "primary_keywords": [
            "patient_id", "patient", "subject_id", "case_id", "age", "gender", "sex", "bmi",
            "blood_pressure", "bp", "systolic", "diastolic", "glucose", "sugar", "fbs",
            "cholesterol", "diagnosis", "disease", "condition", "treatment", "admission_date",
            "hospital", "heart_rate", "trestbps"
        ],
        "combination_rules": [
            {"has_vitals": ["blood_pressure", "bp", "glucose", "bmi", "cholesterol", "heart_rate"], "weight": 0.45},
            {"has_clinical_id": ["patient_id", "patient", "diagnosis", "disease", "admission"], "weight": 0.40}
        ]
    }
}

ACADEMIC_SUBJECTS = [
    "math", "maths", "mathematics", "science", "english", "computer", "physics", "chemistry",
    "biology", "history", "geography", "social_science", "art", "hindi", "language", "economics",
    "accountancy", "business_studies", "statistics", "french", "german", "spanish", "tamil", "kannada"
]

def detect_dataset_domain(df: pd.DataFrame, filename: Optional[str] = None) -> Dict[str, Any]:
    """
    Intelligently infer dataset domain using multi-signal statistical & column topology heuristics.
    Returns domain, confidence score, explanatory reason, and detected field roles.
    Supports optional filename parameter.
    """
    cols = [str(c) for c in df.columns]
    norm_cols = [normalize_col(c) for c in cols]
    col_map = dict(zip(norm_cols, cols))
    
    num_cols = list(df.select_dtypes(include=[np.number]).columns)
    cat_cols = list(df.select_dtypes(include=["object", "category", "string"]).columns)
    
    fn_norm = normalize_col(filename) if filename else ""

    scores: Dict[str, float] = {}
    detected_fields_by_domain: Dict[str, Dict[str, Any]] = {}
    reasons_by_domain: Dict[str, str] = {}

    # 1. Student / Education Scoring
    student_score = 0.0
    found_subjects = []
    has_student_id = False
    has_attendance = False
    has_marks_keyword = False

    for n_c, orig_c in col_map.items():
        if orig_c in num_cols:
            if any(s in n_c for s in ACADEMIC_SUBJECTS) and not any(k in n_c for k in ["salary", "price", "cost", "revenue", "rate", "income"]):
                found_subjects.append(orig_c)
        if any(k in n_c for k in ["student_id", "roll_no", "roll_number", "roll", "reg_no", "admission_no"]):
            has_student_id = True
        elif any(k in n_c for k in ["name", "student_name"]) and not any(k in n_c for k in ["product", "company", "emp", "campaign"]):
            has_student_id = True
        if any(k in n_c for k in ["attendance", "attendance_pct", "present"]):
            has_attendance = True
        if any(k in n_c for k in ["marks", "grade", "score", "gpa"]):
            has_marks_keyword = True

    if len(found_subjects) >= 2:
        student_score += min(0.60, len(found_subjects) * 0.15)
    if has_student_id:
        student_score += 0.22
    if has_attendance:
        student_score += 0.18
    if has_marks_keyword:
        student_score += 0.12

    if fn_norm and any(k in fn_norm for k in DOMAIN_SIGNATURES["student"]["filename_keywords"]):
        student_score += 0.20

    if student_score > 0:
        scores["student"] = min(0.98, student_score)
        reason_parts = []
        if found_subjects:
            reason_parts.append(f"{len(found_subjects)} academic subjects detected ({', '.join(found_subjects[:3])})")
        if has_student_id:
            reason_parts.append("student identifier")
        if has_attendance:
            reason_parts.append("attendance tracking field")
        reasons_by_domain["student"] = "Academic " + ", ".join(reason_parts) if reason_parts else "Student performance markers detected"
        
        s_id = next((c for c in cols if any(k in normalize_col(c) for k in ["student_id", "roll", "reg_no", "id"])), None)
        s_name = next((c for c in cols if any(k in normalize_col(c) for k in ["name", "student_name"])), None)
        s_att = next((c for c in num_cols if any(k in normalize_col(c) for k in ["attendance", "present"])), None)
        s_grd = next((c for c in cols if any(k in normalize_col(c) for k in ["grade", "division"])), None)
        
        detected_fields_by_domain["student"] = {
            "student_id": s_id,
            "id_col": s_id,
            "name": s_name,
            "name_col": s_name,
            "subjects": found_subjects,
            "subject_cols": found_subjects,
            "attendance": s_att,
            "attendance_col": s_att,
            "grade": s_grd,
            "grade_col": s_grd
        }

    # 2. General Scoring for Other Domains
    for domain_key, sig in DOMAIN_SIGNATURES.items():
        if domain_key == "student":
            continue

        score = 0.0
        matched_kw = []
        for n_c in norm_cols:
            for kw in sig["primary_keywords"]:
                if kw in n_c or n_c == kw:
                    matched_kw.append(col_map[n_c])
                    score += 0.14
                    break

        # Check combination rules
        for rule in sig.get("combination_rules", []):
            rule_matched = False
            for k, kw_list in rule.items():
                if k == "weight":
                    continue
                if any(any(kw in n_c for kw in kw_list) for n_c in norm_cols):
                    rule_matched = True
            if rule_matched:
                score += rule.get("weight", 0.2)

        if fn_norm and any(k in fn_norm for k in sig.get("filename_keywords", [])):
            score += 0.20

        # Domain specific boosts & field mappings
        if domain_key == "ecommerce":
            has_sales = any(any(k in n_c for k in ["sales", "revenue", "price", "profit"]) for n_c in norm_cols)
            has_prod = any(any(k in n_c for k in ["product", "item", "category"]) for n_c in norm_cols)
            if has_sales and has_prod:
                score += 0.35
            scores["ecommerce"] = min(0.98, score)
            reasons_by_domain["ecommerce"] = "Product catalog, sales/revenue transactions, and commercial pricing fields detected"
            
            p_col = next((c for c in cols if any(k in normalize_col(c) for k in ["product", "item", "sku"])), None)
            c_col = next((c for c in cols if any(k in normalize_col(c) for k in ["category", "cat", "department"])), None)
            r_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["revenue", "sales", "amount"])), None)
            pr_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["profit", "margin"])), None)
            px_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["price", "unit_price"])), None)
            q_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["quantity", "qty", "units"])), None)
            d_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["discount", "disc"])), None)
            rt_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["rating", "score"])), None)
            
            detected_fields_by_domain["ecommerce"] = {
                "product": p_col,
                "product_col": p_col,
                "category": c_col,
                "category_col": c_col,
                "revenue": r_col,
                "sales": r_col,
                "sales_col": r_col,
                "profit": pr_col,
                "profit_col": pr_col,
                "price": px_col,
                "price_col": px_col,
                "quantity": q_col,
                "qty_col": q_col,
                "discount": d_col,
                "discount_col": d_col,
                "rating": rt_col,
                "rating_col": rt_col,
            }

        elif domain_key == "hr":
            has_emp = any(any(k in n_c for k in ["employee", "emp", "staff"]) for n_c in norm_cols)
            has_dept_sal = any(any(k in n_c for k in ["department", "dept", "salary", "compensation"]) for n_c in norm_cols)
            if has_emp or has_dept_sal:
                score += 0.30
            scores["hr"] = min(0.98, score)
            reasons_by_domain["hr"] = "Employee identifiers, departmental allocation, and workforce compensation metrics detected"
            
            e_id = next((c for c in cols if any(k in normalize_col(c) for k in ["employee_id", "emp_id", "staff_id", "id"])), None)
            d_col = next((c for c in cols if any(k in normalize_col(c) for k in ["department", "dept", "division"])), None)
            s_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["salary", "compensation", "wage", "income"])), None)
            ex_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["experience", "exp", "tenure", "years"])), None)
            pf_col = next((c for c in cols if any(k in normalize_col(c) for k in ["performance", "rating", "appraisal"])), None)
            at_col = next((c for c in cols if any(k in normalize_col(c) for k in ["attrition", "left", "status"])), None)
            ag_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["age"])), None)
            
            detected_fields_by_domain["hr"] = {
                "employee_id": e_id,
                "emp_id_col": e_id,
                "department": d_col,
                "dept_col": d_col,
                "salary": s_col,
                "salary_col": s_col,
                "experience": ex_col,
                "exp_col": ex_col,
                "performance": pf_col,
                "perf_col": pf_col,
                "attrition": at_col,
                "attrition_col": at_col,
                "age": ag_col,
                "age_col": ag_col,
            }

        elif domain_key == "banking":
            has_credit = any(any(k in n_c for k in ["credit", "cibil", "fico"]) for n_c in norm_cols)
            has_balance_loan = any(any(k in n_c for k in ["balance", "loan", "deposit", "account"]) for n_c in norm_cols)
            if has_credit and has_balance_loan:
                score += 0.35
            scores["banking"] = min(0.98, score)
            reasons_by_domain["banking"] = "Credit score, account balance, loan delinquency, and banking financial fields detected"
            
            c_id = next((c for c in cols if any(k in normalize_col(c) for k in ["customer_id", "cust_id", "account_no", "id"])), None)
            cs_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["credit_score", "credit", "cibil", "fico"])), None)
            b_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["balance", "deposit"])), None)
            i_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["income", "salary"])), None)
            l_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["loan", "credit_limit"])), None)
            df_col = next((c for c in cols if any(k in normalize_col(c) for k in ["default", "delinquent", "churn"])), None)
            ag_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["age"])), None)
            
            detected_fields_by_domain["banking"] = {
                "customer_id": c_id,
                "cust_id_col": c_id,
                "credit_score": cs_col,
                "credit_col": cs_col,
                "balance": b_col,
                "balance_col": b_col,
                "income": i_col,
                "income_col": i_col,
                "loan": l_col,
                "loan_col": l_col,
                "default": df_col,
                "default_col": df_col,
                "age": ag_col,
                "age_col": ag_col,
            }

        elif domain_key == "healthcare":
            has_vitals = any(any(k in n_c for k in ["bmi", "glucose", "blood_pressure", "bp", "cholesterol"]) for n_c in norm_cols)
            has_patient = any(any(k in n_c for k in ["patient", "diagnosis", "disease", "admission"]) for n_c in norm_cols)
            if has_vitals or has_patient:
                score += 0.30
            scores["healthcare"] = min(0.98, score)
            reasons_by_domain["healthcare"] = "Clinical population vitals, demographic parameters, and diagnostic categories detected"
            
            p_id = next((c for c in cols if any(k in normalize_col(c) for k in ["patient_id", "patient", "id"])), None)
            ag_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["age"])), None)
            g_col = next((c for c in cols if any(k in normalize_col(c) for k in ["gender", "sex"])), None)
            bm_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["bmi"])), None)
            bp_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["blood_pressure", "bp", "trestbps"])), None)
            gl_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["glucose", "sugar", "fbs"])), None)
            dg_col = next((c for c in cols if any(k in normalize_col(c) for k in ["diagnosis", "disease", "outcome", "target"])), None)
            
            detected_fields_by_domain["healthcare"] = {
                "patient_id": p_id,
                "patient_id_col": p_id,
                "age": ag_col,
                "age_col": ag_col,
                "gender": g_col,
                "gender_col": g_col,
                "bmi": bm_col,
                "bmi_col": bm_col,
                "blood_pressure": bp_col,
                "bp_col": bp_col,
                "glucose": gl_col,
                "glucose_col": gl_col,
                "diagnosis": dg_col,
                "diag_col": dg_col,
            }

        elif domain_key == "marketing":
            has_funnel = any(any(k in n_c for k in ["impressions", "clicks", "conversions", "ctr"]) for n_c in norm_cols)
            has_ad = any(any(k in n_c for k in ["campaign", "channel", "ad_spend", "roas"]) for n_c in norm_cols)
            if has_funnel and has_ad:
                score += 0.35
            scores["marketing"] = min(0.98, score)
            reasons_by_domain["marketing"] = "Advertising funnel indicators (impressions, clicks, conversions) and marketing campaign fields detected"
            
            cmp_col = next((c for c in cols if any(k in normalize_col(c) for k in ["campaign", "ad_name"])), None)
            chn_col = next((c for c in cols if any(k in normalize_col(c) for k in ["channel", "source", "medium"])), None)
            imp_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["impression", "views"])), None)
            clk_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["click", "visits"])), None)
            cnv_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["conversion", "leads"])), None)
            cst_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["cost", "spend", "ad_spend"])), None)
            rv_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["revenue", "sales"])), None)
            
            detected_fields_by_domain["marketing"] = {
                "campaign": cmp_col,
                "campaign_col": cmp_col,
                "channel": chn_col,
                "channel_col": chn_col,
                "impressions": imp_col,
                "impr_col": imp_col,
                "clicks": clk_col,
                "clicks_col": clk_col,
                "conversions": cnv_col,
                "conv_col": cnv_col,
                "cost": cst_col,
                "cost_col": cst_col,
                "revenue": rv_col,
                "rev_col": rv_col,
            }

        elif domain_key == "finance":
            has_acc = any(any(k in n_c for k in ["assets", "liabilities", "ebitda", "opex", "cogs", "cash_flow"]) for n_c in norm_cols)
            if has_acc:
                score += 0.30
            scores["finance"] = min(0.98, score)
            reasons_by_domain["finance"] = "Accounting ledger, balance sheet entries, and operating expenditure metrics detected"
            
            r_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["revenue", "gross_sales", "income"])), None)
            exp_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["expense", "cost", "opex"])), None)
            p_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["profit", "net_income", "ebitda"])), None)
            as_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["assets"])), None)
            li_col = next((c for c in num_cols if any(k in normalize_col(c) for k in ["liabilities", "debt"])), None)
            
            detected_fields_by_domain["finance"] = {
                "revenue": r_col,
                "rev_col": r_col,
                "expense": exp_col,
                "exp_col": exp_col,
                "profit": p_col,
                "profit_col": p_col,
                "assets": as_col,
                "asset_col": as_col,
                "liabilities": li_col,
                "liab_col": li_col,
            }

    # Find winning domain with threshold 0.45
    sorted_domains = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    if sorted_domains and sorted_domains[0][1] >= 0.45:
        best_domain, best_score = sorted_domains[0]
        confidence = round(float(min(0.99, max(0.80, best_score + 0.15))), 2)
        reason = reasons_by_domain.get(best_domain, "Domain patterns identified successfully.")
        detected_fields = detected_fields_by_domain.get(best_domain, {})
    else:
        best_domain = "generic"
        confidence = 1.0
        reason = "Standard structured tabular dataset. General statistical & exploratory analysis engine active."
        detected_fields = {
            "numeric_columns": num_cols,
            "categorical_columns": cat_cols,
            "total_columns": cols
        }

    possible_domains = [
        {"domain": d, "confidence": round(float(min(0.99, max(0.50, sc))), 2)}
        for d, sc in sorted_domains if sc >= 0.30
    ]

    return {
        "domain": best_domain,
        "confidence": confidence,
        "reason": reason,
        "detected_fields": detected_fields,
        "possible_domains": possible_domains
    }
