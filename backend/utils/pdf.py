"""Reusable ReportLab table builders for the generated health report."""
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

LABEL_COLUMN_BACKGROUND = '#f7fafc'
STRIPE_BACKGROUND = '#f7fafc'
GRID_COLOR = '#e2e8f0'


def label_value_table(rows, col_widths, font_size=10):
    """Two column table whose first column holds bold labels."""
    table = Table(rows, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor(LABEL_COLUMN_BACKGROUND)),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), font_size),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor(GRID_COLOR))
    ]))
    return table


def header_table(rows, header_color, col_widths=None, striped=False, font_size=9):
    """Table with a coloured header row, optionally with striped body rows."""
    table = Table(rows, colWidths=col_widths)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(header_color)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), font_size),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]

    if striped:
        style.append(
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor(STRIPE_BACKGROUND)])
        )

    table.setStyle(TableStyle(style))
    return table
