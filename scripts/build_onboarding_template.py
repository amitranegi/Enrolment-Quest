#!/usr/bin/env python3
"""Generates onboarding/companies.xlsx — the spreadsheet template non-
technical people fill in to add a new client company. Re-run this any time
the template's columns need to change; it always rebuilds from scratch
(it does NOT preserve existing data — don't run it against a workbook with
real company rows already in it).

Paired with scripts/import_companies.py, which reads filled-in rows from
this workbook and generates the actual game files (see that script's
docstring, and docs/client-onboarding.md's "Spreadsheet" section).

Usage:
    python3 scripts/build_onboarding_template.py
"""
from __future__ import annotations

import os

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule
from openpyxl.utils import get_column_letter

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(REPO_ROOT, "onboarding", "companies.xlsx")

HEADER_FILL = PatternFill("solid", fgColor="6E4520")
HEADER_FONT = Font(color="FFF8E8", bold=True)
TITLE_FONT = Font(bold=True, size=14, color="6E4520")
EXAMPLE_FILL = PatternFill("solid", fgColor="FFF4D9")
MAX_ROWS = 300  # generous headroom for data validation ranges / formatting


def style_header(ws, row, n_cols):
    for c in range(1, n_cols + 1):
        cell = ws.cell(row=row, column=c)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(vertical="center", wrap_text=True)
    ws.row_dimensions[row].height = 32
    # Use a plain coordinate string here, not ws.cell(row+1, 1) — calling
    # .cell() to *read* a cell still registers that row with openpyxl,
    # which then shifts every subsequent ws.append() down by one row.
    ws.freeze_panes = f"A{row + 1}"


def autosize(ws, widths):
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


def add_status_colors(ws, col_letter, first_row, last_row):
    rng = f"{col_letter}{first_row}:{col_letter}{last_row}"
    ws.conditional_formatting.add(
        rng,
        CellIsRule(operator="equal", formula=['"imported"'], fill=PatternFill("solid", fgColor="D7F5DC")),
    )
    ws.conditional_formatting.add(
        rng,
        CellIsRule(operator="beginsWith", formula=['"error"'], fill=PatternFill("solid", fgColor="F8D7D7")),
    )


def build():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    wb = Workbook()

    # ---------------------------------------------------------------- Instructions
    ws = wb.active
    ws.title = "Instructions"
    ws["A1"] = "Add a Company — fill this in, save, open a PR"
    ws["A1"].font = Font(bold=True, size=16, color="6E4520")
    lines = [
        "",
        "1. Open the \"Company\" tab and add one row for your new company.",
        "   Leave the \"status\" column blank — the import script fills it in.",
        "2. Open the \"GMC Plans\" tab and add at least one medical cover plan",
        "   row for that company (match the \"company_id\" exactly).",
        "3. \"Super Top-Up\" and \"Term Life\" tabs are optional — only add rows",
        "   there if this company actually offers those.",
        "4. \"Addons\" tab is optional too — leave it empty to use the standard",
        "   Wellbeing Bazaar catalogue (what almost every company uses).",
        "5. Put the company's logo at:",
        "     onboarding/incoming/<company_id>/<the filename you wrote>",
        "   e.g. onboarding/incoming/acme/logo.png",
        "6. Run: python3 scripts/import_companies.py",
        "   This turns your rows into real game files and marks each row",
        "   \"imported\" (or writes a specific error message if something's",
        "   missing, without touching any other row).",
        "7. Commit the generated files + this workbook, open a PR as usual.",
        "",
        "See the \"Example Co\" row on every tab for a fully filled example",
        "(real Tarento numbers) — copy its shape, not its values. Its status",
        "is \"example\" so the import script always ignores it — leave that",
        "row in place as a reference, don't delete it.",
        "",
        "Full reference: docs/client-onboarding.md",
    ]
    for i, line in enumerate(lines, start=2):
        ws.cell(row=i, column=1, value=line)
    ws.column_dimensions["A"].width = 90
    ws.sheet_view.showGridLines = False

    # ---------------------------------------------------------------- Company
    ws = wb.create_sheet("Company")
    headers = [
        "id", "company_name", "tagline", "portal_url",
        "max_spouse", "max_child", "max_parent", "logo_filename", "status",
    ]
    ws.append(headers)
    style_header(ws, 1, len(headers))
    ws.append(["example_co", "Example Co", "Benefits Adventure", "https://benefits.loophealth.com/",
                1, 3, 2, "logo.png", "example"])
    for c in range(1, len(headers) + 1):
        ws.cell(row=2, column=c).fill = EXAMPLE_FILL
    autosize(ws, [16, 26, 22, 34, 11, 11, 11, 18, 22])
    add_status_colors(ws, "I", 2, MAX_ROWS)

    # ---------------------------------------------------------------- GMC Plans
    ws = wb.create_sheet("GMC Plans")
    headers = [
        "company_id", "plan_name", "description", "sum_insured", "premium",
        "feature_1_label", "feature_1_value", "feature_2_label", "feature_2_value",
        "feature_3_label", "feature_3_value", "feature_4_label", "feature_4_value",
    ]
    ws.append(headers)
    style_header(ws, 1, len(headers))
    ws.append([
        "example_co", "Base", "Your essential health protection for you and your family, ready from day one.",
        500000, 0,
        "Normal & ICU Room Rent", "Normal - 1.5% of Sum Insured, ICU - At actuals",
        "Parental Co-pay", "20%", "Cataract", "INR 40,000/- per eye", "Maternity cover", "Normal - INR 75,000",
    ])
    for c in range(1, len(headers) + 1):
        ws.cell(row=2, column=c).fill = EXAMPLE_FILL
    autosize(ws, [16, 20, 44, 13, 11] + [18, 24] * 4)

    # ---------------------------------------------------------------- Super Top-Up
    ws = wb.create_sheet("Super Top-Up")
    headers = ["company_id", "name", "description", "sum_insured", "premium"]
    ws.append(headers)
    style_header(ws, 1, len(headers))
    ws.append(["", "", "(optional — leave this tab empty if this company has no Super Top-Up)", "", ""])
    autosize(ws, [16, 22, 50, 13, 11])

    # ---------------------------------------------------------------- Term Life
    ws = wb.create_sheet("Term Life")
    headers = ["company_id", "tier_name", "description", "sum_insured", "premium"]
    ws.append(headers)
    style_header(ws, 1, len(headers))
    ws.append(["", "", "(optional — leave this tab empty if this company has no Term Life cover)", "", ""])
    autosize(ws, [16, 22, 50, 13, 11])

    # ---------------------------------------------------------------- Addons
    ws = wb.create_sheet("Addons")
    headers = ["company_id", "addon_name", "price", "per", "eligibility", "description", "image_filename"]
    ws.append(headers)
    style_header(ws, 1, len(headers))
    ws.append(["", "", "", "", "", "(optional — leave empty to use the standard add-on catalogue)", ""])
    autosize(ws, [16, 22, 10, 10, 20, 44, 20])
    per_dv = DataValidation(type="list", formula1='"member,family"', allow_blank=True)
    elig_dv = DataValidation(type="list", formula1='"Everyone,Female adults 18+,Parents only"', allow_blank=True)
    ws.add_data_validation(per_dv)
    ws.add_data_validation(elig_dv)
    per_dv.add(f"D2:D{MAX_ROWS}")
    elig_dv.add(f"E2:E{MAX_ROWS}")

    # ---------------------------------------------------------------- Cross-sheet company_id dropdowns
    company_range = f"Company!$A$2:$A${MAX_ROWS}"
    for sheet_name, col in [("GMC Plans", "A"), ("Super Top-Up", "A"), ("Term Life", "A"), ("Addons", "A")]:
        ws = wb[sheet_name]
        dv = DataValidation(type="list", formula1=company_range, allow_blank=True, showErrorMessage=False)
        ws.add_data_validation(dv)
        dv.add(f"{col}3:{col}{MAX_ROWS}")  # row 2 is the fixed example row

    wb.save(OUT_PATH)
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    build()
