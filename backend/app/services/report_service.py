import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from backend.app.core.config import REPORTS_DIR
from backend.app.services.profiling_service import generate_dataset_profile
from backend.app.services.ai_service import generate_heuristic_ai_insights
from backend.app.services.stats_service import compute_correlation_matrix

def generate_pdf_report(df: pd.DataFrame, dataset_id: int, dataset_name: str, title: Optional[str] = None) -> str:
    """Generate high-quality multi-page executive PDF report with ReportLab."""
    report_title = title or f"AI DataSense Analytics Report — {dataset_name}"
    unique_filename = f"report_{dataset_id}_{uuid.uuid4().hex[:8]}.pdf"
    file_path = REPORTS_DIR / unique_filename
    
    profile = generate_dataset_profile(df, dataset_id, dataset_name)
    ai_insights = generate_heuristic_ai_insights(df, dataset_id, dataset_name)
    corr = compute_correlation_matrix(df)
    
    doc = SimpleDocTemplate(
        str(file_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    PRIMARY = colors.HexColor("#1E293B")
    ACCENT = colors.HexColor("#4F46E5")
    SUCCESS = colors.HexColor("#059669")
    TEXT_DARK = colors.HexColor("#0F172A")
    MUTED = colors.HexColor("#64748B")
    BG_LIGHT = colors.HexColor("#F8FAFC")
    CARD_BG = colors.HexColor("#EEF2FF")
    
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=MUTED,
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=ACCENT,
        spaceBefore=14,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK
    )
    
    card_title_style = ParagraphStyle(
        "CardTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=ACCENT
    )
    
    story = []
    
    story.append(Paragraph("AI DATASENSE — EXECUTIVE ANALYTICS REPORT", ParagraphStyle("Banner", fontName="Helvetica-Bold", fontSize=9, textColor=ACCENT, spaceAfter=4)))
    story.append(Paragraph(report_title, title_style))
    story.append(Paragraph(f"Generated on {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')} | Confidential & Automated", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceAfter=15))
    
    story.append(Paragraph("1. Dataset Overview & Data Quality Scorecard", h2_style))
    
    kpi_data = [
        [
            Paragraph(f"<b>Total Records:</b> {profile.rows:,}", body_style),
            Paragraph(f"<b>Total Columns:</b> {profile.columns}", body_style),
            Paragraph(f"<b>Memory Size:</b> {profile.memory_usage_kb} KB", body_style)
        ],
        [
            Paragraph(f"<b>Missing Cells:</b> {profile.total_missing_cells} ({profile.missing_cells_pct}%)", body_style),
            Paragraph(f"<b>Duplicates:</b> {profile.duplicate_rows_count} ({profile.duplicate_rows_pct}%)", body_style),
            Paragraph(f"<b>Health Score:</b> <font color='#059669'><b>{profile.data_quality_score} / 100</b></font>", body_style)
        ]
    ]
    
    kpi_table = Table(kpi_data, colWidths=[180, 180, 180])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("2. Executive AI Synthesis", h2_style))
    story.append(Paragraph(ai_insights.executive_summary, body_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("3. Descriptive Statistics Summary", h2_style))
    if profile.numeric_stats:
        table_rows = [["Feature", "Mean", "Std Dev", "Min", "Median (Q2)", "Max", "Skew"]]
        for ns in profile.numeric_stats[:8]:
            table_rows.append([
                ns.name[:18],
                f"{ns.mean:,.2f}" if ns.mean is not None else "-",
                f"{ns.std:,.2f}" if ns.std is not None else "-",
                f"{ns.min:,.2f}" if ns.min is not None else "-",
                f"{ns.median:,.2f}" if ns.median is not None else "-",
                f"{ns.max:,.2f}" if ns.max is not None else "-",
                f"{ns.skewness:.2f}" if ns.skewness is not None else "-"
            ])
            
        stats_table = Table(table_rows, colWidths=[120, 70, 70, 70, 70, 70, 70])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(stats_table)
    else:
        story.append(Paragraph("No continuous numeric attributes present for descriptive statistics.", body_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("4. Key Findings & Correlations", h2_style))
    for f in ai_insights.key_findings[:3]:
        story.append(Paragraph(f"<b>• {f.title}:</b> {f.summary}", body_style))
        for bp in f.bullet_points[:2]:
            story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;– {bp}", ParagraphStyle("SubBullet", parent=body_style, textColor=MUTED)))
            
    if corr.top_positive_pairs:
        story.append(Spacer(1, 4))
        p = corr.top_positive_pairs[0]
        story.append(Paragraph(f"<b>• Primary Driver:</b> Strong positive correlation between <i>{p['var1']}</i> and <i>{p['var2']}</i> (r = +{p['correlation']:.2f}).", body_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("5. AI Strategic Recommendations & Action Items", h2_style))
    for rec in ai_insights.strategic_recommendations:
        story.append(Paragraph(f"<b>[{rec.badge.upper()}] {rec.title}</b>", card_title_style))
        story.append(Paragraph(rec.summary, body_style))
        for bp in rec.bullet_points:
            story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;✓ {bp}", body_style))
        story.append(Spacer(1, 4))
        
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MUTED))
    story.append(Paragraph("Generated by AI DataSense — Industry-Level AI + Machine Learning Analytics Platform.", ParagraphStyle("Foot", fontName="Helvetica-Oblique", fontSize=8, textColor=MUTED, alignment=1)))

    doc.build(story)
    return str(file_path)

def generate_excel_report(df: pd.DataFrame, dataset_id: int, dataset_name: str) -> str:
    """Generate professional multi-sheet Excel workbook with OpenPyXL."""
    unique_filename = f"analytics_{dataset_id}_{uuid.uuid4().hex[:8]}.xlsx"
    file_path = REPORTS_DIR / unique_filename
    
    profile = generate_dataset_profile(df, dataset_id, dataset_name)
    corr = compute_correlation_matrix(df)
    ai_insights = generate_heuristic_ai_insights(df, dataset_id, dataset_name)
    
    wb = openpyxl.Workbook()
    
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    title_font = Font(name="Calibri", size=14, bold=True, color="1E293B")
    bold_font = Font(name="Calibri", size=11, bold=True)
    regular_font = Font(name="Calibri", size=11)
    border_thin = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    # ---------------- SHEET 1: EXECUTIVE SUMMARY ----------------
    ws_summary = wb.active
    ws_summary.title = "Executive Summary"
    ws_summary.views.sheetView[0].showGridLines = True
    
    ws_summary["A1"] = f"AI DataSense — Analytics Report: {dataset_name}"
    ws_summary["A1"].font = title_font
    ws_summary["A2"] = f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}"
    ws_summary["A2"].font = Font(name="Calibri", size=10, italic=True, color="64748B")
    
    kpis = [
        ("Total Records", profile.rows),
        ("Total Columns", profile.columns),
        ("Memory (KB)", profile.memory_usage_kb),
        ("Total Missing Cells", profile.total_missing_cells),
        ("Missing %", f"{profile.missing_cells_pct}%"),
        ("Duplicate Rows", profile.duplicate_rows_count),
        ("Data Quality Score", f"{profile.data_quality_score} / 100")
    ]
    
    ws_summary["A4"] = "Metric"
    ws_summary["B4"] = "Value"
    ws_summary["A4"].fill = header_fill
    ws_summary["B4"].fill = header_fill
    ws_summary["A4"].font = header_font
    ws_summary["B4"].font = header_font
    
    for row_idx, (k, v) in enumerate(kpis, start=5):
        ws_summary[f"A{row_idx}"] = k
        ws_summary[f"B{row_idx}"] = str(v)
        ws_summary[f"A{row_idx}"].border = border_thin
        ws_summary[f"B{row_idx}"].border = border_thin
        ws_summary[f"A{row_idx}"].font = bold_font
        ws_summary[f"B{row_idx}"].font = regular_font

    ws_summary["A14"] = "Executive AI Synthesis:"
    ws_summary["A14"].font = bold_font
    ws_summary["A15"] = ai_insights.executive_summary
    ws_summary["A15"].font = regular_font

    # ---------------- SHEET 2: NUMERICAL STATS ----------------
    ws_stats = wb.create_sheet(title="Descriptive Statistics")
    ws_stats.views.sheetView[0].showGridLines = True
    
    headers = ["Feature", "Count", "Missing", "Mean", "Std Dev", "Min", "25%", "Median", "75%", "Max", "IQR", "Skewness", "Kurtosis"]
    for c_idx, h in enumerate(headers, start=1):
        cell = ws_stats.cell(row=1, column=c_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")
        
    for r_idx, ns in enumerate(profile.numeric_stats, start=2):
        row_vals = [
            ns.name, ns.count, ns.missing, ns.mean, ns.std, ns.min, ns.q25, ns.median, ns.q75, ns.max, ns.iqr, ns.skewness, ns.kurtosis
        ]
        for c_idx, val in enumerate(row_vals, start=1):
            cell = ws_stats.cell(row=r_idx, column=c_idx, value=val)
            cell.border = border_thin
            cell.font = regular_font

    # ---------------- SHEET 3: CORRELATION MATRIX ----------------
    ws_corr = wb.create_sheet(title="Correlation Matrix")
    ws_corr.views.sheetView[0].showGridLines = True
    
    if corr.columns and corr.matrix:
        ws_corr.cell(row=1, column=1, value="Feature").fill = header_fill
        ws_corr.cell(row=1, column=1).font = header_font
        for c_idx, col_name in enumerate(corr.columns, start=2):
            cell = ws_corr.cell(row=1, column=c_idx, value=col_name)
            cell.fill = header_fill
            cell.font = header_font
            
        for r_idx, (col_name, row_vals) in enumerate(zip(corr.columns, corr.matrix), start=2):
            ws_corr.cell(row=r_idx, column=1, value=col_name).font = bold_font
            ws_corr.cell(row=r_idx, column=1).border = border_thin
            for c_idx, val in enumerate(row_vals, start=2):
                cell = ws_corr.cell(row=r_idx, column=c_idx, value=val)
                cell.border = border_thin
                cell.font = regular_font

    # ---------------- SHEET 4: RAW DATASET ----------------
    ws_data = wb.create_sheet(title="Dataset Sample")
    ws_data.views.sheetView[0].showGridLines = True
    
    for c_idx, col_name in enumerate(df.columns, start=1):
        cell = ws_data.cell(row=1, column=c_idx, value=str(col_name))
        cell.fill = header_fill
        cell.font = header_font
        
    sample_df = df.head(1000)
    for r_idx, row in enumerate(sample_df.values, start=2):
        for c_idx, val in enumerate(row, start=1):
            cell = ws_data.cell(row=r_idx, column=c_idx, value=str(val) if pd.notna(val) else "")
            cell.border = border_thin

    for ws in wb.worksheets:
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(12, min(40, max_len + 3))
            
    wb.save(str(file_path))
    return str(file_path)
