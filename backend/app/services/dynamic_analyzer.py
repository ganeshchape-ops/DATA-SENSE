from typing import Dict, Any, Optional, List
import pandas as pd
from backend.app.models.db_models import Dataset
from backend.app.services.analyzers import get_analyzer, ANALYZERS_REGISTRY
from backend.app.services.dataset_detector import detect_dataset_domain
from backend.app.schemas.api_schemas import KPICard

class Tuple_Domain_Info:
    def __init__(self, domain: str, confidence: float, reason: str, is_overridden: bool, mapping: Dict[str, Any], detected_fields: Dict[str, Any]):
        self.domain = domain
        self.confidence = confidence
        self.reason = reason
        self.is_overridden = is_overridden
        self.mapping = mapping
        self.detected_fields = detected_fields

def get_effective_domain_info(
    df: pd.DataFrame,
    dataset: Optional[Dataset] = None,
    domain: Optional[str] = None,
    dataset_name: Optional[str] = None
) -> Tuple_Domain_Info:
    """Resolve domain metadata considering manual override or automatic detection."""
    forced_domain = domain or (dataset.domain_override if dataset else None)
    if forced_domain:
        analyzer = get_analyzer(forced_domain)
        detected = detect_dataset_domain(df, dataset_name or (dataset.name if dataset else None))
        mapping = (dataset.column_mapping if dataset else None) or detected["detected_fields"]
        return Tuple_Domain_Info(
            domain=forced_domain,
            confidence=1.0,
            reason=f"Manually configured as {analyzer.domain_display_name}.",
            is_overridden=True,
            mapping=mapping,
            detected_fields=detected["detected_fields"]
        )
    elif dataset and dataset.domain and dataset.domain != "generic" and dataset.domain_confidence:
        detected = detect_dataset_domain(df, dataset.name if dataset else None)
        mapping = dataset.column_mapping or detected["detected_fields"]
        return Tuple_Domain_Info(
            domain=dataset.domain,
            confidence=dataset.domain_confidence or 0.95,
            reason=dataset.domain_reason or detected["reason"],
            is_overridden=False,
            mapping=mapping,
            detected_fields=detected["detected_fields"]
        )
    else:
        detected = detect_dataset_domain(df, dataset_name or (dataset.name if dataset else None))
        mapping = (dataset.column_mapping if dataset else None) or detected["detected_fields"]
        return Tuple_Domain_Info(
            domain=detected["domain"],
            confidence=detected["confidence"],
            reason=detected["reason"],
            is_overridden=False,
            mapping=mapping,
            detected_fields=detected["detected_fields"]
        )

def generate_dynamic_dashboard_overview(
    df: pd.DataFrame,
    dataset: Optional[Dataset] = None,
    dataset_name: Optional[str] = None,
    domain: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate unified, domain-aware SaaS dashboard response for any uploaded dataset.
    """
    info = get_effective_domain_info(df, dataset=dataset, domain=domain, dataset_name=dataset_name)
    analyzer = get_analyzer(info.domain)

    # 1. Domain-specific KPI Cards
    raw_kpis = analyzer.get_kpi_cards(df, info.mapping)
    kpis = [
        KPICard(
            key=k.get("key", "metric"),
            title=k.get("title", "Metric"),
            value=str(k.get("value", "0")),
            numeric_value=float(k.get("numeric_value", 0.0)),
            prefix=k.get("prefix", ""),
            suffix=k.get("suffix", ""),
            change_pct=float(k.get("change_pct", 0.0)),
            change_type=k.get("change_type", "neutral"),
            trend_description=k.get("trend_description", ""),
            icon=k.get("icon", "Activity")
        )
        for k in raw_kpis
    ]

    # 2. Domain-specific Dynamic Charts
    dynamic_charts = analyzer.get_charts(df, info.mapping)

    # 3. Domain Analysis Metrics & Insights
    metrics = analyzer.analyze(df, info.mapping)
    ai_insights = analyzer.get_ai_insights(df, info.mapping)

    # 4. Populate backward-compatible chart slots if ecommerce, else synthesize clean defaults
    sales_trend = []
    revenue_analysis = []
    profit_trend = []
    target_vs_actual = []
    customer_distribution = []
    product_performance = []
    regional_performance = []
    monthly_growth = []

    if info.domain == "ecommerce":
        for p in metrics.get("top_products", []):
            product_performance.append({
                "product": p["product"],
                "revenue": p["revenue"],
                "share": p["share"]
            })
        for c in metrics.get("category_breakdown", []):
            customer_distribution.append({
                "segment": c["category"],
                "count": c.get("sales", c.get("count", 0)),
                "percentage": c["share"],
                "color": "#4F46E5"
            })
        for r in metrics.get("regional_performance", []):
            regional_performance.append({
                "region": r["region"],
                "sales": r["sales"],
                "growth": 12.5,
                "share": r["share"]
            })

    return {
        "domain": info.domain,
        "domain_display_name": analyzer.domain_display_name,
        "domain_confidence": info.confidence,
        "domain_reason": info.reason,
        "domain_override": (dataset.domain_override if dataset else None) or domain,
        "detected_fields": info.detected_fields,
        "kpis": kpis,
        "dynamic_charts": dynamic_charts,
        "summary_metrics": metrics,
        "ai_summary": ai_insights.get("executive_summary"),
        # Backward-compatible fields
        "sales_trend": sales_trend,
        "revenue_analysis": revenue_analysis,
        "profit_trend": profit_trend,
        "target_vs_actual": target_vs_actual,
        "customer_distribution": customer_distribution,
        "product_performance": product_performance,
        "regional_performance": regional_performance,
        "monthly_growth": monthly_growth
    }
