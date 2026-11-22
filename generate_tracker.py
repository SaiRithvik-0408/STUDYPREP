import json
import re
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

# Load data.js
with open('data.js', 'r', encoding='utf-8') as f:
    raw_content = f.read()

# Extract JSON object from window.CURRICULUM_DATA = { ... };
json_match = re.search(r'window\.CURRICULUM_DATA\s*=\s*(\{[\s\S]*\});?\s*$', raw_content)
if not json_match:
    raise ValueError("Could not parse window.CURRICULUM_DATA from data.js")

curriculum_data = json.loads(json_match.group(1))
days_dict = curriculum_data.get('days', {})
phases_list = curriculum_data.get('phases', [])

wb = openpyxl.Workbook()

# Style constants
FONT_FAMILY = "Segoe UI"
header_font = Font(name=FONT_FAMILY, size=11, bold=True, color="FFFFFF")
title_font = Font(name=FONT_FAMILY, size=16, bold=True, color="0F172A")
subtitle_font = Font(name=FONT_FAMILY, size=10, italic=True, color="475569")
section_font = Font(name=FONT_FAMILY, size=12, bold=True, color="0F172A")
bold_font = Font(name=FONT_FAMILY, size=10, bold=True, color="0F172A")
regular_font = Font(name=FONT_FAMILY, size=10, color="1E293B")
kpi_label_font = Font(name=FONT_FAMILY, size=9, bold=True, color="64748B")
kpi_value_font = Font(name=FONT_FAMILY, size=18, bold=True, color="0284C7")

header_fill_navy = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
header_fill_cyan = PatternFill(start_color="0284C7", end_color="0284C7", fill_type="solid")
kpi_fill = PatternFill(start_color="F0F9FF", end_color="F0F9FF", fill_type="solid")
kpi_border_fill = PatternFill(start_color="E0F2FE", end_color="E0F2FE", fill_type="solid")
row_alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
white_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

thin_border_side = Side(border_style="thin", color="CBD5E1")
thin_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
thick_bottom = Border(bottom=Side(border_style="medium", color="0284C7"))

align_center = Alignment(horizontal="center", vertical="center")
align_left = Alignment(horizontal="left", vertical="center")
align_right = Alignment(horizontal="right", vertical="center")

# =========================================================================
# SHEET 1: DASHBOARD & SUMMARY
# =========================================================================
ws_dash = wb.active
ws_dash.title = "Dashboard & Summary"
ws_dash.views.sheetView[0].showGridLines = True

ws_dash["B2"] = "SDE-Mastery 40: Full-Stack & AI Systems Tracker"
ws_dash["B2"].font = title_font
ws_dash["B3"] = "Track your 40-Day senior engineering journey across desktop, tablet, and mobile devices."
ws_dash["B3"].font = subtitle_font

# KPI Blocks
kpi_labels = [
    ("Total Days", "40", "B5", "B6"),
    ("Completed Days", "='Daily Tracker'!K46", "C5", "C6"),
    ("In Progress", "='Daily Tracker'!K47", "D5", "D6"),
    ("Not Started", "='Daily Tracker'!K48", "E5", "E6"),
    ("Mastery %", "='Daily Tracker'!K49", "F5", "F6"),
    ("Hours Studied", "='Daily Tracker'!M44", "G5", "G6")
]

for label, formula, cell_lbl, cell_val in kpi_labels:
    ws_dash[cell_lbl] = label
    ws_dash[cell_lbl].font = kpi_label_font
    ws_dash[cell_lbl].alignment = align_center
    ws_dash[cell_lbl].fill = kpi_border_fill
    ws_dash[cell_lbl].border = thin_border
    
    ws_dash[cell_val] = formula
    ws_dash[cell_val].font = kpi_value_font
    ws_dash[cell_val].alignment = align_center
    ws_dash[cell_val].fill = kpi_fill
    ws_dash[cell_val].border = thin_border
    if label == "Mastery %":
        ws_dash[cell_val].number_format = "0.0%"
    elif label == "Hours Studied":
        ws_dash[cell_val].number_format = "0.0"

# Phase Progress Table
ws_dash["B9"] = "Curriculum Phase Breakdown"
ws_dash["B9"].font = section_font

phase_headers = ["Phase", "Phase Title", "Days Range", "Completed Days", "Target Days", "Phase Progress %"]
for col_idx, h in enumerate(phase_headers, start=2):
    c = ws_dash.cell(row=10, column=col_idx, value=h)
    c.font = header_font
    c.fill = header_fill_navy
    c.alignment = align_center
    c.border = thin_border

phases_meta = [
    ("Phase 1", "Foundations & Core Mechanics", "Days 01 - 10", "=COUNTIF('Daily Tracker'!D4:D13, \"Completed\")", 10),
    ("Phase 2", "Core Engineering, Databases & Advanced DSA", "Days 11 - 20", "=COUNTIF('Daily Tracker'!D14:D23, \"Completed\")", 10),
    ("Phase 3", "Distributed Systems, Dynamic Programming & Agents", "Days 21 - 30", "=COUNTIF('Daily Tracker'!D24:D33, \"Completed\")", 10),
    ("Phase 4", "Full-Stack AI Capstones & Senior Job Switch Mastery", "Days 31 - 40", "=COUNTIF('Daily Tracker'!D34:D43, \"Completed\")", 10)
]

for idx, (p_id, p_title, p_range, f_comp, p_target) in enumerate(phases_meta, start=11):
    fill = row_alt_fill if idx % 2 == 0 else white_fill
    ws_dash.cell(row=idx, column=2, value=p_id).alignment = align_center
    ws_dash.cell(row=idx, column=3, value=p_title).alignment = align_left
    ws_dash.cell(row=idx, column=4, value=p_range).alignment = align_center
    ws_dash.cell(row=idx, column=5, value=f_comp).alignment = align_center
    ws_dash.cell(row=idx, column=6, value=p_target).alignment = align_center
    
    prog_cell = ws_dash.cell(row=idx, column=7, value=f"=E{idx}/F{idx}")
    prog_cell.alignment = align_center
    prog_cell.number_format = "0.0%"
    
    for c_i in range(2, 8):
        ws_dash.cell(row=idx, column=c_i).font = regular_font
        ws_dash.cell(row=idx, column=c_i).fill = fill
        ws_dash.cell(row=idx, column=c_i).border = thin_border

# Module Checklist Completion Breakdown Table
ws_dash["B17"] = "Core Module Completion Rates (All 40 Days)"
ws_dash["B17"].font = section_font

mod_headers = ["Module", "Discipline", "Completed Units", "Total Units", "Completion %"]
for col_idx, h in enumerate(mod_headers, start=2):
    c = ws_dash.cell(row=18, column=col_idx, value=h)
    c.font = header_font
    c.fill = header_fill_cyan
    c.alignment = align_center
    c.border = thin_border

modules_meta = [
    ("DSA", "Data Structures, Algorithms & LeetCode", "=COUNTIF('Daily Tracker'!E4:E43, \"Y\")", 40),
    ("Backend", "V8 Engine, Node.js Internals, PostgreSQL, Redis", "=COUNTIF('Daily Tracker'!F4:F43, \"Y\")", 40),
    ("Frontend", "Browser Engine, DOM, React 18/19 Fiber, Zustand", "=COUNTIF('Daily Tracker'!G4:G43, \"Y\")", 40),
    ("Docker", "Linux Containers, Cgroups, Multi-Stage Builds, K8s", "=COUNTIF('Daily Tracker'!H4:H43, \"Y\")", 40),
    ("AI", "LLMs, BPE Tokens, Structured JSON Schemas, Agents", "=COUNTIF('Daily Tracker'!I4:I43, \"Y\")", 40),
    ("Drills", "Event Loop Puzzles, Practical Code Drills, Verification", "=COUNTIF('Daily Tracker'!J4:J43, \"Y\")", 40)
]

for idx, (m_id, m_desc, f_comp, m_target) in enumerate(modules_meta, start=19):
    fill = row_alt_fill if idx % 2 == 0 else white_fill
    ws_dash.cell(row=idx, column=2, value=m_id).alignment = align_center
    ws_dash.cell(row=idx, column=3, value=m_desc).alignment = align_left
    ws_dash.cell(row=idx, column=4, value=f_comp).alignment = align_center
    ws_dash.cell(row=idx, column=5, value=m_target).alignment = align_center
    
    prog_cell = ws_dash.cell(row=idx, column=6, value=f"=D{idx}/E{idx}")
    prog_cell.alignment = align_center
    prog_cell.number_format = "0.0%"
    
    for c_i in range(2, 7):
        ws_dash.cell(row=idx, column=c_i).font = regular_font
        ws_dash.cell(row=idx, column=c_i).fill = fill
        ws_dash.cell(row=idx, column=c_i).border = thin_border

# Device Portability & Sync Instructions
ws_dash["B27"] = "📱 How to Use & Sync Across Any Device"
ws_dash["B27"].font = section_font

instructions = [
    ("1. Google Drive / Google Sheets (Mobile & Web)", "Upload this .xlsx file directly to Google Drive. Open it in Google Sheets on your phone, tablet, or work laptop. All checkboxes, formulas, and progress calculations work 100% seamlessly in real time!"),
    ("2. Microsoft OneDrive / Office 365", "Save to your OneDrive folder. Open via the free Excel app on iOS/Android or in Excel for the web. Changes auto-save across all your devices."),
    ("3. Web App 1-Click Sync", "In the SDE-Mastery 40 Web Portal, click 'Sync & Export' to instantly download your current progress as an updated Excel (.xlsx) file, CSV file, or copy the raw JSON backup to clipboard."),
    ("4. Accurate Progress Formula", "Entering 'Y' for each module automatically computes the Day's completion percentage and updates status from 'Not Started' -> 'In Progress' -> 'Completed'. No manual status guessing needed!")
]

for idx, (step_title, step_desc) in enumerate(instructions, start=28):
    ws_dash.cell(row=idx, column=2, value=step_title).font = bold_font
    ws_dash.cell(row=idx, column=2).alignment = align_left
    ws_dash.merge_cells(start_row=idx, start_column=3, end_row=idx, end_column=7)
    desc_cell = ws_dash.cell(row=idx, column=3, value=step_desc)
    desc_cell.font = regular_font
    desc_cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

# Adjust Dashboard Column Widths
ws_dash.column_dimensions["A"].width = 3
ws_dash.column_dimensions["B"].width = 18
ws_dash.column_dimensions["C"].width = 46
ws_dash.column_dimensions["D"].width = 16
ws_dash.column_dimensions["E"].width = 16
ws_dash.column_dimensions["F"].width = 18
ws_dash.column_dimensions["G"].width = 18

# =========================================================================
# SHEET 2: DAILY TRACKER (DAYS 01 - 40)
# =========================================================================
ws_daily = wb.create_sheet(title="Daily Tracker")
ws_daily.views.sheetView[0].showGridLines = True

headers = [
    "Day #", "Phase", "Curriculum Topic Title", "Status",
    "DSA", "Backend", "Frontend", "Docker", "AI", "Drills",
    "Done / 6", "Day %", "Hours Spent", "Confidence (1-5)", "Date Completed", "Key Takeaways & Notes"
]

ws_daily.row_dimensions[3].height = 28
for col_idx, h in enumerate(headers, start=1):
    c = ws_daily.cell(row=3, column=col_idx, value=h)
    c.font = header_font
    c.fill = header_fill_navy
    c.alignment = align_center
    c.border = thin_border

# Validation for Y/N
dv_yn = DataValidation(type="list", formula1='"Y,N"', allow_blank=True)
ws_daily.add_data_validation(dv_yn)
dv_yn.add("E4:J43")

# Validation for Confidence
dv_conf = DataValidation(type="whole", operator="between", formula1=1, formula2=5, allow_blank=True)
ws_daily.add_data_validation(dv_conf)
dv_conf.add("N4:N43")

for d_num in range(1, 41):
    row_idx = d_num + 3
    day_str = str(d_num)
    day_info = days_dict.get(day_str, {})
    
    phase_id = day_info.get('phaseId', 'phase-1')
    phase_label = "Phase 1" if phase_id == "phase-1" else "Phase 2" if phase_id == "phase-2" else "Phase 3" if phase_id == "phase-3" else "Phase 4"
    day_title = day_info.get('title', f'Day {d_num} Study Guide')
    
    fill = row_alt_fill if d_num % 2 == 0 else white_fill
    
    ws_daily.cell(row=row_idx, column=1, value=d_num).alignment = align_center
    ws_daily.cell(row=row_idx, column=2, value=phase_label).alignment = align_center
    ws_daily.cell(row=row_idx, column=3, value=day_title).alignment = align_left
    
    # Status formula: If Done=6 -> Completed; If Done>0 -> In Progress; Else Not Started
    status_formula = f'=IF(K{row_idx}=6, "Completed", IF(K{row_idx}>0, "In Progress", "Not Started"))'
    ws_daily.cell(row=row_idx, column=4, value=status_formula).alignment = align_center
    
    # Checkbox columns (E to J) default to empty
    for c_i in range(5, 11):
        cell_yn = ws_daily.cell(row=row_idx, column=c_i, value="")
        cell_yn.alignment = align_center
        cell_yn.font = regular_font
        cell_yn.fill = fill
        cell_yn.border = thin_border
    
    # Done / 6 Formula
    done_formula = f'=COUNTIF(E{row_idx}:J{row_idx}, "Y")'
    cell_done = ws_daily.cell(row=row_idx, column=11, value=done_formula)
    cell_done.alignment = align_center
    cell_done.font = bold_font
    cell_done.fill = fill
    cell_done.border = thin_border
    
    # Day % Formula
    pct_formula = f'=K{row_idx}/6'
    cell_pct = ws_daily.cell(row=row_idx, column=12, value=pct_formula)
    cell_pct.alignment = align_center
    cell_pct.font = bold_font
    cell_pct.number_format = "0%"
    cell_pct.fill = fill
    cell_pct.border = thin_border
    
    # Hours Spent
    cell_hrs = ws_daily.cell(row=row_idx, column=13, value="")
    cell_hrs.alignment = align_center
    cell_hrs.number_format = "0.0"
    cell_hrs.font = regular_font
    cell_hrs.fill = fill
    cell_hrs.border = thin_border
    
    # Confidence Score
    cell_conf = ws_daily.cell(row=row_idx, column=14, value="")
    cell_conf.alignment = align_center
    cell_conf.font = regular_font
    cell_conf.fill = fill
    cell_conf.border = thin_border
    
    # Date Completed
    cell_date = ws_daily.cell(row=row_idx, column=15, value="")
    cell_date.alignment = align_center
    cell_date.number_format = "YYYY-MM-DD"
    cell_date.font = regular_font
    cell_date.fill = fill
    cell_date.border = thin_border
    
    # Notes
    cell_notes = ws_daily.cell(row=row_idx, column=16, value="")
    cell_notes.alignment = align_left
    cell_notes.font = regular_font
    cell_notes.fill = fill
    cell_notes.border = thin_border
    
    for c_i in range(1, 5):
        ws_daily.cell(row=row_idx, column=c_i).font = regular_font
        ws_daily.cell(row=row_idx, column=c_i).fill = fill
        ws_daily.cell(row=row_idx, column=c_i).border = thin_border

# Totals & Summary Row at the bottom of Daily Tracker
tot_row = 44
ws_daily.cell(row=tot_row, column=3, value="Total Completed Units / Hours").alignment = align_right
ws_daily.cell(row=tot_row, column=3).font = bold_font

for col_idx in range(5, 11):
    c_letter = get_column_letter(col_idx)
    ws_daily.cell(row=tot_row, column=col_idx, value=f'=COUNTIF({c_letter}4:{c_letter}43, "Y")').alignment = align_center
    ws_daily.cell(row=tot_row, column=col_idx).font = bold_font
    ws_daily.cell(row=tot_row, column=col_idx).border = thin_border

ws_daily.cell(row=tot_row, column=11, value='=SUM(K4:K43)').alignment = align_center
ws_daily.cell(row=tot_row, column=11).font = bold_font
ws_daily.cell(row=tot_row, column=11).border = thin_border

ws_daily.cell(row=tot_row, column=12, value='=K44/240').alignment = align_center
ws_daily.cell(row=tot_row, column=12).font = bold_font
ws_daily.cell(row=tot_row, column=12).number_format = "0.0%"
ws_daily.cell(row=tot_row, column=12).border = thin_border

ws_daily.cell(row=tot_row, column=13, value='=SUM(M4:M43)').alignment = align_center
ws_daily.cell(row=tot_row, column=13).font = bold_font
ws_daily.cell(row=tot_row, column=13).number_format = "0.0"
ws_daily.cell(row=tot_row, column=13).border = thin_border

ws_daily.cell(row=tot_row, column=14, value='=AVERAGE(N4:N43)').alignment = align_center
ws_daily.cell(row=tot_row, column=14).font = bold_font
ws_daily.cell(row=tot_row, column=14).number_format = "0.0"
ws_daily.cell(row=tot_row, column=14).border = thin_border

# Helper KPI Reference cells for Dashboard
ws_daily.cell(row=46, column=10, value="Completed Count:").font = kpi_label_font
ws_daily.cell(row=46, column=11, value='=COUNTIF(D4:D43, "Completed")').font = bold_font
ws_daily.cell(row=47, column=10, value="In Progress Count:").font = kpi_label_font
ws_daily.cell(row=47, column=11, value='=COUNTIF(D4:D43, "In Progress")').font = bold_font
ws_daily.cell(row=48, column=10, value="Not Started Count:").font = kpi_label_font
ws_daily.cell(row=48, column=11, value='=COUNTIF(D4:D43, "Not Started")').font = bold_font
ws_daily.cell(row=49, column=10, value="Mastery Pct:").font = kpi_label_font
ws_daily.cell(row=49, column=11, value='=K46/40').font = bold_font

# Column widths
ws_daily.column_dimensions["A"].width = 8
ws_daily.column_dimensions["B"].width = 11
ws_daily.column_dimensions["C"].width = 54
ws_daily.column_dimensions["D"].width = 15
ws_daily.column_dimensions["E"].width = 7
ws_daily.column_dimensions["F"].width = 9
ws_daily.column_dimensions["G"].width = 10
ws_daily.column_dimensions["H"].width = 8
ws_daily.column_dimensions["I"].width = 7
ws_daily.column_dimensions["J"].width = 8
ws_daily.column_dimensions["K"].width = 10
ws_daily.column_dimensions["L"].width = 9
ws_daily.column_dimensions["M"].width = 13
ws_daily.column_dimensions["N"].width = 16
ws_daily.column_dimensions["O"].width = 16
ws_daily.column_dimensions["P"].width = 40

# Freeze top rows
ws_daily.freeze_panes = "D4"

# =========================================================================
# SHEET 3: DRILLS & INTERVIEW CHALLENGES
# =========================================================================
ws_drills = wb.create_sheet(title="Drills & Exercises Tracker")
ws_drills.views.sheetView[0].showGridLines = True

drill_headers = [
    "Day #", "Phase", "Drill Type", "Focus Concept & Challenge", "Format", "Status", "Confidence", "Key Learnings & Bug Fixes"
]

ws_drills.row_dimensions[3].height = 26
for col_idx, h in enumerate(drill_headers, start=1):
    c = ws_drills.cell(row=3, column=col_idx, value=h)
    c.font = header_font
    c.fill = header_fill_cyan
    c.alignment = align_center
    c.border = thin_border

sample_drills = [
    (1, "Phase 1", "Event Loop Simulator", "Predict exact execution order with Synchronous Call Stack, Microtask Queue (Promises), and Macrotasks (Timers)", "Execution Trace", "Unsolved", "", "Promise executor runs synchronously; .then() goes to microtasks!"),
    (2, "Phase 1", "React Reconciliation Drill", "Stale closures in useEffect & index-as-key state leakage during item deletion", "Bug Hunt & Fix", "Unsolved", "", "Index keys preserve DOM node state on wrong items."),
    (3, "Phase 1", "Docker Linux Kernel Drill", "Inspect cgroup memory limits (OOM-killer exit code 137) and PID namespace tree", "DevOps Debugging", "Unsolved", "", "Namespaces isolate visibility; Cgroups enforce resource quotas."),
    (4, "Phase 1", "LLM Structured Output Drill", "Force strict JSON Schema decoding with Pydantic/Zod & compute token cost asymmetry", "API Engineering", "Unsolved", "", "Output generation is sequential O(K) and more expensive than prefill."),
    (5, "Phase 1", "DSA Two Pointers Challenge", "In-place array manipulation without auxiliary arrays in O(N) time and O(1) space", "LeetCode Drill", "Unsolved", "", "Fast pointer scans while slow pointer writes target values.")
]

for idx, drill in enumerate(sample_drills, start=4):
    fill = row_alt_fill if idx % 2 == 0 else white_fill
    for c_i, val in enumerate(drill, start=1):
        cell = ws_drills.cell(row=idx, column=c_i, value=val)
        cell.font = regular_font
        cell.fill = fill
        cell.border = thin_border
        if c_i in [1, 2, 5, 6, 7]:
            cell.alignment = align_center
        else:
            cell.alignment = align_left

for d_num in range(6, 41):
    idx = d_num + 3
    day_str = str(d_num)
    day_info = days_dict.get(day_str, {})
    phase_id = day_info.get('phaseId', 'phase-1')
    phase_label = "Phase 1" if phase_id == "phase-1" else "Phase 2" if phase_id == "phase-2" else "Phase 3" if phase_id == "phase-3" else "Phase 4"
    fill = row_alt_fill if idx % 2 == 0 else white_fill
    
    ws_drills.cell(row=idx, column=1, value=d_num).alignment = align_center
    ws_drills.cell(row=idx, column=2, value=phase_label).alignment = align_center
    ws_drills.cell(row=idx, column=3, value="Practical Drill").alignment = align_left
    ws_drills.cell(row=idx, column=4, value=f"{day_info.get('title', 'Daily Practice Drill')} - Concept Verification & Exercises").alignment = align_left
    ws_drills.cell(row=idx, column=5, value="Hands-on / QA").alignment = align_center
    ws_drills.cell(row=idx, column=6, value="Unsolved").alignment = align_center
    ws_drills.cell(row=idx, column=7, value="").alignment = align_center
    ws_drills.cell(row=idx, column=8, value="").alignment = align_left
    
    for c_i in range(1, 9):
        ws_drills.cell(row=idx, column=c_i).font = regular_font
        ws_drills.cell(row=idx, column=c_i).fill = fill
        ws_drills.cell(row=idx, column=c_i).border = thin_border

ws_drills.column_dimensions["A"].width = 8
ws_drills.column_dimensions["B"].width = 12
ws_drills.column_dimensions["C"].width = 24
ws_drills.column_dimensions["D"].width = 54
ws_drills.column_dimensions["E"].width = 16
ws_drills.column_dimensions["F"].width = 12
ws_drills.column_dimensions["G"].width = 13
ws_drills.column_dimensions["H"].width = 46
ws_drills.freeze_panes = "D4"

# =========================================================================
# SHEET 4: DSA PROBLEM CATALOG
# =========================================================================
ws_dsa = wb.create_sheet(title="DSA LeetCode Tracker")
ws_dsa.views.sheetView[0].showGridLines = True

dsa_headers = [
    "LC #", "Problem Name", "Difficulty", "Pattern / Category", "Time Target", "Space Target", "Status", "Review Date", "Optimal Approach Notes"
]

ws_dsa.row_dimensions[3].height = 26
for col_idx, h in enumerate(dsa_headers, start=1):
    c = ws_dsa.cell(row=3, column=col_idx, value=h)
    c.font = header_font
    c.fill = header_fill_navy
    c.alignment = align_center
    c.border = thin_border

dsa_problems = [
    (1, "Two Sum", "Easy", "Arrays & Hash Table", "O(N)", "O(N)", "Unsolved", "", "One-pass hash map complement check"),
    (167, "Two Sum II - Input Array Is Sorted", "Medium", "Two Pointers (Converging)", "O(N)", "O(1)", "Unsolved", "", "Left/Right collision pointers on sorted array"),
    (26, "Remove Duplicates from Sorted Array", "Easy", "Two Pointers (Fast/Slow)", "O(N)", "O(1)", "Unsolved", "", "Write pointer updates when nums[fast] != nums[slow]"),
    (283, "Move Zeroes", "Easy", "Two Pointers (Writer/Reader)", "O(N)", "O(1)", "Unsolved", "", "Swap non-zero elements into writer index"),
    (15, "3Sum", "Medium", "Two Pointers + Sort", "O(N^2)", "O(1)", "Unsolved", "", "Sort array, fix first number, two pointers on remaining elements"),
    (11, "Container With Most Water", "Medium", "Two Pointers (Greedy Bounds)", "O(N)", "O(1)", "Unsolved", "", "Always advance pointer pointing to smaller height"),
    (42, "Trapping Rain Water", "Hard", "Two Pointers / Monotonic Stack", "O(N)", "O(1)", "Unsolved", "", "Track left_max and right_max from outer bounds inward"),
    (3, "Longest Substring Without Repeating Characters", "Medium", "Sliding Window (Variable)", "O(N)", "O(min(N, M))", "Unsolved", "", "Window expansion with last seen character index map"),
    (76, "Minimum Window Substring", "Hard", "Sliding Window (Frequency Map)", "O(N + M)", "O(M)", "Unsolved", "", "Expand right until valid; shrink left while still valid"),
    (141, "Linked List Cycle", "Easy", "Fast & Slow Pointers (Floyd's)", "O(N)", "O(1)", "Unsolved", "", "Slow moves 1 step, fast moves 2 steps; cycle if they collide"),
    (206, "Reverse Linked List", "Easy", "In-Place Pointer Reversal", "O(N)", "O(1)", "Unsolved", "", "Iterative prev, curr, next pointer manipulation"),
    (104, "Maximum Depth of Binary Tree", "Easy", "Tree DFS / BFS", "O(N)", "O(H)", "Unsolved", "", "Recursive 1 + max(left, right) or level-order queue"),
    (200, "Number of Islands", "Medium", "Graph DFS / BFS / Union-Find", "O(M*N)", "O(M*N)", "Unsolved", "", "Sink land cells to '0' during flood fill traversal")
]

for idx, p in enumerate(dsa_problems, start=4):
    fill = row_alt_fill if idx % 2 == 0 else white_fill
    for c_i, val in enumerate(p, start=1):
        cell = ws_dsa.cell(row=idx, column=c_i, value=val)
        cell.font = regular_font
        cell.fill = fill
        cell.border = thin_border
        if c_i in [1, 3, 5, 6, 7, 8]:
            cell.alignment = align_center
        else:
            cell.alignment = align_left

ws_dsa.column_dimensions["A"].width = 8
ws_dsa.column_dimensions["B"].width = 38
ws_dsa.column_dimensions["C"].width = 12
ws_dsa.column_dimensions["D"].width = 28
ws_dsa.column_dimensions["E"].width = 14
ws_dsa.column_dimensions["F"].width = 14
ws_dsa.column_dimensions["G"].width = 14
ws_dsa.column_dimensions["H"].width = 14
ws_dsa.column_dimensions["I"].width = 46
ws_dsa.freeze_panes = "C4"

# Save Workbook
excel_path = "SDE_Mastery_40_Progress_Tracker.xlsx"
wb.save(excel_path)
print(f"Successfully generated Excel tracker at: {excel_path}")

# Also generate a universal CSV version for instant Google Sheets / mobile drag-and-drop
import csv

csv_path = "SDE_Mastery_40_Progress_Tracker.csv"
with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "Day #", "Phase", "Curriculum Topic Title", "Status",
        "DSA", "Backend", "Frontend", "Docker", "AI", "Drills",
        "Done / 6", "Day %", "Hours Spent", "Confidence (1-5)", "Date Completed", "Notes"
    ])
    for d_num in range(1, 41):
        day_str = str(d_num)
        day_info = days_dict.get(day_str, {})
        phase_id = day_info.get('phaseId', 'phase-1')
        phase_label = "Phase 1" if phase_id == "phase-1" else "Phase 2" if phase_id == "phase-2" else "Phase 3" if phase_id == "phase-3" else "Phase 4"
        day_title = day_info.get('title', f'Day {d_num} Study Guide')
        writer.writerow([
            d_num, phase_label, day_title, "Not Started",
            "N", "N", "N", "N", "N", "N",
            0, "0%", "", "", "", ""
        ])

print(f"Successfully generated CSV tracker at: {csv_path}")
