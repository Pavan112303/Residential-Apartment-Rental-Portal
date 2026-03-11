"""
lease_pdf.py — Professional Rental Lease Agreement PDF Generator
Uses reportlab to produce a properly structured multi-page PDF.
"""
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

# ── Palette ──────────────────────────────────────────────────────────────────
DARK   = colors.HexColor('#1a202c')   # headings
INDIGO = colors.HexColor('#4f46e5')   # accent / section bars
GRAY   = colors.HexColor('#718096')
LGRAY  = colors.HexColor('#e2e8f0')
WHITE  = colors.white
RED    = colors.HexColor('#c53030')

LEASE_DIR = os.path.join('static', 'leases')
os.makedirs(LEASE_DIR, exist_ok=True)


def _styles():
    base = getSampleStyleSheet()
    def ps(name, **kw):
        return ParagraphStyle(name, parent=base['Normal'], **kw)

    return {
        'title':    ps('ls_title',  fontName='Helvetica-Bold',  fontSize=20, alignment=TA_CENTER, textColor=DARK, spaceAfter=4),
        'subtitle': ps('ls_sub',    fontName='Helvetica',        fontSize=10, alignment=TA_CENTER, textColor=GRAY, spaceAfter=2),
        'section':  ps('ls_sec',    fontName='Helvetica-Bold',   fontSize=10, textColor=WHITE,     spaceBefore=14, spaceAfter=6, leftIndent=6),
        'body':     ps('ls_body',   fontName='Helvetica',        fontSize=9,  textColor=DARK,      spaceAfter=3, leading=14, alignment=TA_JUSTIFY),
        'label':    ps('ls_label',  fontName='Helvetica-Bold',   fontSize=8,  textColor=GRAY,      spaceAfter=1),
        'value':    ps('ls_val',    fontName='Helvetica',        fontSize=9,  textColor=DARK,      spaceAfter=3),
        'bullet':   ps('ls_bullet', fontName='Helvetica',        fontSize=9,  textColor=DARK,      spaceAfter=2, leftIndent=10, bulletIndent=0),
        'clause':   ps('ls_clause', fontName='Helvetica',        fontSize=9,  textColor=DARK,      spaceAfter=4, leftIndent=14, leading=14),
        'sign_lbl': ps('ls_slbl',   fontName='Helvetica',        fontSize=8,  textColor=GRAY),
        'meta_r':   ps('ls_metar',  fontName='Helvetica',        fontSize=8,  textColor=GRAY, alignment=TA_RIGHT),
        'meta_l':   ps('ls_metal',  fontName='Helvetica-Bold',   fontSize=8,  textColor=DARK),
        'cancel':   ps('ls_cancel', fontName='Helvetica-Bold',   fontSize=60, textColor=colors.HexColor('#feb2b220'), alignment=TA_CENTER, spaceAfter=0),
        'footer':   ps('ls_footer', fontName='Helvetica',        fontSize=7,  textColor=GRAY, alignment=TA_CENTER),
    }


def _section_bar(title, S):
    """A full-width coloured section header bar."""
    tbl = Table([[Paragraph(f'  {title}', S['section'])]], colWidths=[17*cm])
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), INDIGO),
        ('ROWPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('BOX', (0,0), (-1,-1), 0, WHITE),
    ]))
    return tbl


def _kv_row(key, value, S):
    """A two-column key-value row."""
    return Table(
        [[Paragraph(key, S['label']), Paragraph(str(value) if value else '—', S['value'])]],
        colWidths=[5*cm, 12*cm]
    )


def generate_lease_pdf(lease, booking, unit, tower, user) -> str:
    """
    Generate a professional PDF lease agreement.
    Returns the relative path: 'static/leases/<agreement_id>.pdf'
    """
    S = _styles()

    agreement_id = lease.agreement_id
    filename = f"{agreement_id}.pdf"
    filepath = os.path.join(LEASE_DIR, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2.5*cm, bottomMargin=2*cm,
        title=f"Lease Agreement — {agreement_id}",
        author="Apartment Management System"
    )

    W, H = A4
    story = []
    is_cancelled = str(lease.status.value if hasattr(lease.status, 'value') else lease.status) == 'CANCELLED'

    # ── WATERMARK (cancelled) ─────────────────────────────────────────────
    if is_cancelled:
        story.append(Paragraph("CANCELLED", S['cancel']))

    # ── HEADER BAND ───────────────────────────────────────────────────────
    header_data = [[
        Paragraph('<b>Apartment Management System</b><br/><font size="8" color="#718096">Official Lease Agreement</font>', S['value']),
        Table([
            [Paragraph(f'<b>Agreement ID:</b>', S['label']), Paragraph(agreement_id, S['value'])],
            [Paragraph('<b>Generated:</b>', S['label']), Paragraph(datetime.utcnow().strftime('%d %B %Y'), S['value'])],
            [Paragraph('<b>Status:</b>', S['label']), Paragraph(lease.status.value if hasattr(lease.status, 'value') else str(lease.status), S['value'])],
        ], colWidths=[2.5*cm, 5.5*cm])
    ]]
    header_tbl = Table(header_data, colWidths=[9*cm, 8*cm])
    header_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEBELOW', (0,0), (-1,0), 1.5, INDIGO),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(header_tbl)
    story.append(Spacer(1, 0.4*cm))

    # ── TITLE ─────────────────────────────────────────────────────────────
    story.append(Paragraph("RESIDENTIAL RENTAL AGREEMENT", S['title']))
    story.append(Paragraph(
        "This Rental Agreement is made between the Property Owner and Tenant<br/>"
        "for the lease of the residential unit described below.",
        S['subtitle']
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=LGRAY, spaceAfter=10))

    # ── SECTION 1 — PROPERTY DETAILS ─────────────────────────────────────
    story.append(_section_bar("SECTION 1 — PROPERTY DETAILS", S))
    prop_rows = [
        ["Tower Name",   tower.name if tower else '—'],
        ["Tower Code",   tower.tower_code if tower else '—'],
        ["Unit Number",  unit.unit_number if unit else '—'],
        ["Floor Number", f"Floor {unit.floor_number}" if unit else '—'],
        ["Flat Type",    unit.flat_type if unit else '—'],
        ["Area",         f"{unit.square_feet} sq.ft" if unit and unit.square_feet else '—'],
        ["Address",      f"{tower.name}, Residential Complex" if tower else '—'],
    ]
    prop_table = Table(
        [[Paragraph(r[0], S['label']), Paragraph(str(r[1]), S['value'])] for r in prop_rows],
        colWidths=[5*cm, 12*cm]
    )
    prop_table.setStyle(TableStyle([
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [colors.HexColor('#f7fafc'), WHITE]),
        ('GRID', (0,0), (-1,-1), 0.3, LGRAY),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(prop_table)

    # ── SECTION 2 — TENANT DETAILS ────────────────────────────────────────
    story.append(_section_bar("SECTION 2 — TENANT DETAILS", S))
    tenant_rows = [
        ["Tenant Name",  user.name if user else '—'],
        ["Email",        user.email if user else '—'],
        ["Phone",        getattr(user, 'phone', '—') or '—'],
        ["Government ID","(To be verified at move-in)"],
    ]
    tenant_table = Table(
        [[Paragraph(r[0], S['label']), Paragraph(str(r[1]), S['value'])] for r in tenant_rows],
        colWidths=[5*cm, 12*cm]
    )
    tenant_table.setStyle(TableStyle([
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [colors.HexColor('#f7fafc'), WHITE]),
        ('GRID', (0,0), (-1,-1), 0.3, LGRAY),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(tenant_table)

    # ── SECTION 3 — LEASE TERM ────────────────────────────────────────────
    story.append(_section_bar("SECTION 3 — LEASE TERM", S))
    start_fmt = lease.start_date.strftime('%d %B %Y') if lease.start_date else '—'
    end_fmt   = lease.end_date.strftime('%d %B %Y')   if lease.end_date   else '—'
    duration_months = booking.lease_duration if booking else '—'
    term_rows = [
        ["Lease Start Date",    start_fmt],
        ["Lease End Date",      end_fmt],
        ["Total Duration",      f"{duration_months} Month(s)"],
        ["Notice Period",       "30 days written notice required for early termination"],
    ]
    term_table = Table(
        [[Paragraph(r[0], S['label']), Paragraph(str(r[1]), S['value'])] for r in term_rows],
        colWidths=[5*cm, 12*cm]
    )
    term_table.setStyle(TableStyle([
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [colors.HexColor('#f7fafc'), WHITE]),
        ('GRID', (0,0), (-1,-1), 0.3, LGRAY),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(term_table)

    # ── SECTION 4 — RENT & DEPOSIT ────────────────────────────────────────
    story.append(_section_bar("SECTION 4 — RENT & DEPOSIT", S))
    rent = unit.rent_amount if unit and unit.rent_amount else 0
    deposit = unit.deposit_amount if unit and unit.deposit_amount else 0
    fin_rows = [
        ["Monthly Rent",        f"₹{rent:,.0f}"],
        ["Security Deposit",    f"₹{deposit:,.0f}"],
        ["Total Move-in Amount",f"₹{(rent + deposit):,.0f}"],
        ["Rent Due Date",       "5th of every calendar month"],
        ["Late Fee Policy",     "₹500 penalty after 5 days of delay in rent payment"],
        ["Payment Mode",        "Bank Transfer / Online Portal"],
    ]
    fin_table = Table(
        [[Paragraph(r[0], S['label']), Paragraph(str(r[1]), S['value'])] for r in fin_rows],
        colWidths=[5*cm, 12*cm]
    )
    fin_table.setStyle(TableStyle([
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [colors.HexColor('#f7fafc'), WHITE]),
        ('GRID', (0,0), (-1,-1), 0.3, LGRAY),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(fin_table)

    # ── SECTION 5 — AMENITIES ─────────────────────────────────────────────
    story.append(_section_bar("SECTION 5 — AMENITIES INCLUDED", S))
    amenity_names = []
    if tower and hasattr(tower, 'amenities') and tower.amenities:
        amenity_names += [a.name for a in tower.amenities]
    if unit and hasattr(unit, 'amenities') and unit.amenities:
        amenity_names += [a.name for a in unit.amenities if a.name not in amenity_names]

    if amenity_names:
        for name in amenity_names:
            story.append(Paragraph(f"• {name}", S['bullet']))
    else:
        story.append(Paragraph("As per property specifications.", S['body']))

    # ── SECTION 6 — MAINTENANCE RESPONSIBILITIES ──────────────────────────
    story.append(_section_bar("SECTION 6 — MAINTENANCE RESPONSIBILITIES", S))
    for clause in [
        "The Tenant agrees to maintain the unit in a clean and good condition throughout the tenancy.",
        "Any damage beyond normal fair wear and tear will be assessed and charged to the Tenant.",
        "Maintenance requests must be submitted via the Tenant Portal.",
        "The Property Owner is responsible for structural repairs and major appliance failures.",
        "Tenant must not carry out any structural modifications without prior written approval.",
    ]:
        story.append(Paragraph(f"• {clause}", S['clause']))

    # ── SECTION 7 — PROPERTY RULES ────────────────────────────────────────
    story.append(_section_bar("SECTION 7 — PROPERTY RULES", S))
    rules = [
        "No illegal activities of any kind are permitted on the premises.",
        "Noise restrictions apply after 10:00 PM. Tenant must ensure minimal disturbance to neighbours.",
        "Subleasing or sub-letting of the premises is strictly prohibited without prior written approval.",
        "Pets are allowed only with prior written management approval.",
        "Common areas must be kept clean and tidy at all times.",
        "Visitors are permitted but overnight guests beyond 7 consecutive days require management notice.",
    ]
    for i, rule in enumerate(rules, 1):
        story.append(Paragraph(f"{i}.  {rule}", S['clause']))

    # ── SECTION 8 — TERMINATION POLICY ───────────────────────────────────
    story.append(_section_bar("SECTION 8 — TERMINATION POLICY", S))
    for clause in [
        "The Tenant may terminate this lease by providing 30 days written notice to the management.",
        "The Property Owner may terminate this lease in case of violation of any of the above rules.",
        "Security deposit will be inspected and refunded within 30 days of vacating the premises.",
        "Deductions from the security deposit may be made for unpaid rent or damages beyond normal wear.",
        "Upon lease expiry, the Tenant must vacate and hand over the keys to the property manager.",
    ]:
        story.append(Paragraph(f"• {clause}", S['clause']))

    # ── SECTION 9 — SIGNATURE SECTION ────────────────────────────────────
    story.append(Spacer(1, 0.5*cm))
    story.append(_section_bar("SECTION 9 — SIGNATURES", S))
    story.append(Spacer(1, 0.4*cm))

    sig_data = [
        [
            Paragraph("<b>Tenant Signature</b>", S['label']),
            Paragraph("", S['label']),
            Paragraph("<b>Property Manager Signature</b>", S['label']),
        ],
        [
            Paragraph("____________________________", S['body']),
            Paragraph("", S['body']),
            Paragraph("____________________________", S['body']),
        ],
        [
            Paragraph(user.name if user else "Tenant", S['sign_lbl']),
            Paragraph("", S['sign_lbl']),
            Paragraph("Authorised Signatory", S['sign_lbl']),
        ],
        [
            Paragraph(f"Date: ______________", S['sign_lbl']),
            Paragraph("", S['sign_lbl']),
            Paragraph(f"Date: ______________", S['sign_lbl']),
        ],
    ]
    sig_table = Table(sig_data, colWidths=[7*cm, 3*cm, 7*cm])
    sig_table.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(sig_table)

    # ── FOOTER ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=LGRAY))
    story.append(Spacer(1, 0.15*cm))
    story.append(Paragraph(
        f"This document was generated electronically by the Apartment Management System on "
        f"{datetime.utcnow().strftime('%d %B %Y at %H:%M UTC')}. "
        f"Agreement ID: {agreement_id}.",
        S['footer']
    ))

    doc.build(story)
    return f"static/leases/{filename}"
