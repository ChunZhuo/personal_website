---
lang: en
layout: post
title: "Single-cell Perturb-seq CRISPRi"
date: 2026-05-11
post_author: Chunzhuo Zhang
description: "An interactive visual explanation of how CRISPRi perturbations are linked to single-cell transcriptomes."
tags: ["biology", "single-cell", "CRISPRi", "Perturb-seq", "functional-genomics"]
categories: research-notes
permalink: /blog/2026/perturb-seq-crispri/
featured: false
_styles: |
  .perturbseq-crispri-viewer {
    --ps-blue: #2f6fbd;
    --ps-cyan: #2daecb;
    --ps-green: #3b9467;
    --ps-gold: #d39b2c;
    --ps-red: #c85c5c;
    --ps-ink: var(--global-text-color);
    --ps-muted: var(--global-text-color-light);
    --ps-border: var(--global-divider-color);
    border: 1px solid var(--ps-border);
    border-radius: 8px;
    margin: 1.5rem 0 2rem;
    overflow: hidden;
    background: var(--global-bg-color);
  }

  .perturbseq-toolbar {
    align-items: center;
    border-bottom: 1px solid var(--ps-border);
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: space-between;
    padding: 0.75rem;
  }

  .perturbseq-step-buttons,
  .perturbseq-zoom-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .perturbseq-crispri-viewer button {
    background: transparent;
    border: 1px solid var(--ps-border);
    border-radius: 6px;
    color: var(--ps-ink);
    cursor: pointer;
    font-size: 0.82rem;
    line-height: 1;
    min-height: 2rem;
    padding: 0.45rem 0.65rem;
  }

  .perturbseq-crispri-viewer button:hover,
  .perturbseq-crispri-viewer button.is-active {
    border-color: var(--global-theme-color);
    color: var(--global-theme-color);
  }

  .perturbseq-zoom-status {
    color: var(--ps-muted);
    font-size: 0.82rem;
    min-width: 3rem;
    text-align: center;
  }

  .perturbseq-canvas-wrap {
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--ps-border) 42%, transparent) 1px, transparent 1px),
      linear-gradient(color-mix(in srgb, var(--ps-border) 42%, transparent) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .perturbseq-svg {
    cursor: grab;
    display: block;
    height: min(66vh, 620px);
    min-height: 420px;
    touch-action: none;
    width: 100%;
  }

  .perturbseq-crispri-viewer.is-dragging .perturbseq-svg {
    cursor: grabbing;
  }

  .perturbseq-node,
  .perturbseq-process,
  .perturbseq-result {
    fill: color-mix(in srgb, var(--global-bg-color) 92%, var(--ps-blue));
    stroke: var(--ps-border);
    stroke-width: 2;
  }

  .perturbseq-flow {
    fill: none;
    stroke: color-mix(in srgb, var(--ps-muted) 70%, transparent);
    stroke-dasharray: 9 9;
    stroke-linecap: round;
    stroke-width: 4;
  }

  .perturbseq-title {
    fill: var(--ps-ink);
    font-size: 22px;
    font-weight: 700;
  }

  .perturbseq-label {
    fill: var(--ps-ink);
    font-size: 15px;
    font-weight: 600;
  }

  .perturbseq-small {
    fill: var(--ps-muted);
    font-size: 12px;
  }

  .perturbseq-gene {
    fill: none;
    stroke: var(--ps-blue);
    stroke-linecap: round;
    stroke-width: 8;
  }

  .perturbseq-rnap {
    fill: var(--ps-gold);
    stroke: color-mix(in srgb, var(--ps-gold) 65%, #000);
    stroke-width: 2;
  }

  .perturbseq-cell {
    fill: color-mix(in srgb, var(--ps-cyan) 14%, var(--global-bg-color));
    stroke: var(--ps-cyan);
    stroke-width: 2;
  }

  .perturbseq-guide-a { fill: var(--ps-blue); }
  .perturbseq-guide-b { fill: var(--ps-green); }
  .perturbseq-guide-c { fill: var(--ps-red); }
  .perturbseq-guide-d { fill: var(--ps-gold); }

  .perturbseq-highlight {
    filter: drop-shadow(0 0 9px color-mix(in srgb, var(--global-theme-color) 80%, transparent));
    opacity: 0.3;
    transition: opacity 240ms ease;
  }

  .perturbseq-crispri-viewer[data-step="1"] .step-1,
  .perturbseq-crispri-viewer[data-step="2"] .step-2,
  .perturbseq-crispri-viewer[data-step="3"] .step-3,
  .perturbseq-crispri-viewer[data-step="4"] .step-4,
  .perturbseq-crispri-viewer[data-step="5"] .step-5,
  .perturbseq-crispri-viewer[data-step="6"] .step-6 {
    opacity: 1;
  }

  .perturbseq-pulse {
    animation: perturbseq-pulse 2.2s ease-in-out infinite;
    transform-origin: center;
  }

  .perturbseq-flow {
    animation: perturbseq-flow 18s linear infinite;
  }

  .perturbseq-dimmed-transcript {
    opacity: 0.28;
  }

  .perturbseq-info {
    border-top: 1px solid var(--ps-border);
    padding: 0.85rem 1rem 1rem;
  }

  .perturbseq-step-label {
    color: var(--global-theme-color);
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .perturbseq-step-text {
    color: var(--ps-muted);
    margin: 0;
  }

  @keyframes perturbseq-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
  }

  @keyframes perturbseq-flow {
    to { stroke-dashoffset: -180; }
  }

  @media (max-width: 640px) {
    .perturbseq-svg {
      height: 520px;
      min-height: 520px;
    }

    .perturbseq-toolbar {
      align-items: stretch;
      flex-direction: column;
    }
  }
---

CRISPRi is a useful perturbation because it behaves like a dimmer switch: the guide RNA brings a catalytically inactive Cas9 repressor to a regulatory region, and transcription drops without making a DNA double-strand break. Perturb-seq adds a pooled single-cell readout, so each cell carries both a perturbation identity and a transcriptome.

The interactive view below follows the experiment from engineered cells to a perturbation map. Scroll over the scene to zoom, drag to pan, and use the numbered controls to focus the explanation.

<div class="perturbseq-crispri-viewer" data-step="1">
  <div class="perturbseq-toolbar" aria-label="Perturb-seq CRISPRi controls">
    <div class="perturbseq-step-buttons">
      <button type="button" data-step-target="1">1</button>
      <button type="button" data-step-target="2">2</button>
      <button type="button" data-step-target="3">3</button>
      <button type="button" data-step-target="4">4</button>
      <button type="button" data-step-target="5">5</button>
      <button type="button" data-step-target="6">6</button>
    </div>
    <div class="perturbseq-zoom-controls">
      <button type="button" data-step-action="prev">Prev</button>
      <button type="button" data-step-action="next">Next</button>
      <button type="button" data-step-action="reset">Reset view</button>
      <span class="perturbseq-zoom-status">100%</span>
    </div>
  </div>

  <div class="perturbseq-canvas-wrap">
    <svg class="perturbseq-svg" viewBox="0 0 1000 620" role="img" aria-label="Interactive diagram of single-cell Perturb-seq CRISPRi">
      <defs>
        <marker id="perturbseq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
        </marker>
      </defs>

      <g class="perturbseq-viewport">
        <text class="perturbseq-title" x="36" y="42">Single-cell Perturb-seq CRISPRi</text>
        <text class="perturbseq-small" x="36" y="66">A pooled knockdown experiment with single-cell transcriptome and guide identity readout.</text>

        <path class="perturbseq-flow" d="M210 160 C310 160 330 280 430 280 S590 280 690 280 S790 440 890 440" marker-end="url(#perturbseq-arrow)"></path>

        <g class="step-1 perturbseq-highlight">
          <rect x="35" y="95" width="245" height="160" rx="8" class="perturbseq-node"></rect>
          <text x="58" y="126" class="perturbseq-label">1. Engineer cells</text>
          <ellipse cx="150" cy="178" rx="70" ry="45" class="perturbseq-cell perturbseq-pulse"></ellipse>
          <circle cx="150" cy="178" r="25" fill="color-mix(in srgb, var(--ps-blue) 18%, var(--global-bg-color))" stroke="var(--ps-blue)" stroke-width="2"></circle>
          <text x="111" y="226" class="perturbseq-small">stable dCas9-KRAB</text>
          <text x="65" y="244" class="perturbseq-small">repressor machinery is present</text>
        </g>

        <g class="step-2 perturbseq-highlight">
          <rect x="330" y="95" width="275" height="160" rx="8" class="perturbseq-node"></rect>
          <text x="352" y="126" class="perturbseq-label">2. Deliver sgRNA pool</text>
          <circle cx="390" cy="176" r="15" class="perturbseq-guide-a perturbseq-pulse"></circle>
          <circle cx="442" cy="176" r="15" class="perturbseq-guide-b perturbseq-pulse"></circle>
          <circle cx="494" cy="176" r="15" class="perturbseq-guide-c perturbseq-pulse"></circle>
          <circle cx="546" cy="176" r="15" class="perturbseq-guide-d perturbseq-pulse"></circle>
          <text x="370" y="218" class="perturbseq-small">sgGeneA</text>
          <text x="430" y="218" class="perturbseq-small">sgGeneB</text>
          <text x="490" y="218" class="perturbseq-small">sgGeneC</text>
          <text x="532" y="238" class="perturbseq-small">controls</text>
        </g>

        <g class="step-3 perturbseq-highlight">
          <rect x="665" y="95" width="295" height="220" rx="8" class="perturbseq-node"></rect>
          <text x="690" y="126" class="perturbseq-label">3. Repress target transcription</text>
          <path d="M710 185 C760 150 820 220 900 170" class="perturbseq-gene"></path>
          <circle cx="795" cy="184" r="24" fill="var(--ps-blue)" opacity="0.88"></circle>
          <rect x="750" y="216" width="90" height="38" rx="18" class="perturbseq-rnap"></rect>
          <path d="M842 236 C865 235 885 235 912 235" stroke="var(--ps-muted)" stroke-width="5" stroke-linecap="round" class="perturbseq-dimmed-transcript"></path>
          <text x="730" y="285" class="perturbseq-small">dCas9-KRAB lowers mRNA output</text>
        </g>

        <g class="step-4 perturbseq-highlight">
          <rect x="60" y="340" width="300" height="205" rx="8" class="perturbseq-process"></rect>
          <text x="86" y="372" class="perturbseq-label">4. Single-cell capture</text>
          <circle cx="135" cy="440" r="38" fill="color-mix(in srgb, var(--ps-cyan) 16%, var(--global-bg-color))" stroke="var(--ps-cyan)" stroke-width="3"></circle>
          <ellipse cx="135" cy="440" rx="21" ry="14" fill="color-mix(in srgb, var(--ps-blue) 18%, var(--global-bg-color))" stroke="var(--ps-blue)" stroke-width="2"></ellipse>
          <circle cx="250" cy="440" r="38" fill="color-mix(in srgb, var(--ps-green) 16%, var(--global-bg-color))" stroke="var(--ps-green)" stroke-width="3"></circle>
          <ellipse cx="250" cy="440" rx="21" ry="14" fill="color-mix(in srgb, var(--ps-blue) 18%, var(--global-bg-color))" stroke="var(--ps-blue)" stroke-width="2"></ellipse>
          <text x="82" y="510" class="perturbseq-small">droplet: cell barcode + UMI + mRNA + guide tag</text>
        </g>

        <g class="step-5 perturbseq-highlight">
          <rect x="410" y="340" width="245" height="205" rx="8" class="perturbseq-process"></rect>
          <text x="435" y="372" class="perturbseq-label">5. Sequence readout</text>
          <g stroke-width="4" stroke-linecap="round">
            <path d="M452 420 H610" stroke="var(--ps-blue)"></path>
            <path d="M452 448 H586" stroke="var(--ps-green)"></path>
            <path d="M452 476 H620" stroke="var(--ps-red)"></path>
          </g>
          <text x="452" y="407" class="perturbseq-small">expression reads</text>
          <text x="452" y="509" class="perturbseq-small">guide identity reads</text>
        </g>

        <g class="step-6 perturbseq-highlight">
          <rect x="705" y="340" width="245" height="205" rx="8" class="perturbseq-result"></rect>
          <text x="730" y="372" class="perturbseq-label">6. Perturbation map</text>
          <g opacity="0.95">
            <circle cx="765" cy="444" r="8" class="perturbseq-guide-a"></circle>
            <circle cx="792" cy="420" r="8" class="perturbseq-guide-a"></circle>
            <circle cx="810" cy="452" r="8" class="perturbseq-guide-a"></circle>
            <circle cx="855" cy="415" r="8" class="perturbseq-guide-b"></circle>
            <circle cx="885" cy="436" r="8" class="perturbseq-guide-b"></circle>
            <circle cx="842" cy="475" r="8" class="perturbseq-guide-c"></circle>
            <circle cx="888" cy="490" r="8" class="perturbseq-guide-c"></circle>
            <circle cx="804" cy="500" r="8" class="perturbseq-guide-d"></circle>
          </g>
          <text x="735" y="520" class="perturbseq-small">cells grouped by transcriptional response</text>
        </g>
      </g>
    </svg>

  </div>

  <div class="perturbseq-info">
    <div class="perturbseq-step-label">1. Engineer CRISPRi cells</div>
    <p class="perturbseq-step-text">Cells first receive the transcriptional repressor machinery, usually dCas9-KRAB or a stronger variant.</p>
  </div>
</div>

<script src="{{ '/assets/js/perturbseq-crispri.js' | relative_url | bust_file_cache }}"></script>

## What the experiment measures

The key output is not only whether a target gene went down. The useful object is a table where every row is a single cell, every cell has a guide assignment, and every column is a measured gene. That lets us ask whether perturbing one regulator shifts cells toward another state, suppresses a pathway, changes response to stimulation, or creates a subtle expression program that would be invisible in a bulk assay.

## Why CRISPRi fits this readout

CRISPRi is especially useful when complete knockout is too harsh or when multiple perturbations would create too many DNA breaks. Because it represses transcription through dCas9-KRAB rather than cutting DNA, it can be paired with pooled single-cell screens where the phenotype is a transcriptome, not just growth.

## Minimal protocol logic

1. Build or obtain a cell line expressing CRISPRi machinery.
2. Introduce a pooled sgRNA library at controlled multiplicity.
3. Select and culture cells long enough for repression.
4. Capture single cells and prepare transcriptome plus guide libraries.
5. Sequence, assign guides to cells, and quantify expression.
6. Compare each perturbation against controls and visualize response programs.
