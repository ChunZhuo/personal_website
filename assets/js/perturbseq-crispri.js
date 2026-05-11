(function () {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function initViewer(root) {
    const svg = root.querySelector(".perturbseq-svg");
    const viewport = root.querySelector(".perturbseq-viewport");
    const status = root.querySelector(".perturbseq-zoom-status");
    const stepLabel = root.querySelector(".perturbseq-step-label");
    const stepText = root.querySelector(".perturbseq-step-text");
    const buttons = root.querySelectorAll("[data-step-target]");
    const prev = root.querySelector("[data-step-action='prev']");
    const next = root.querySelector("[data-step-action='next']");
    const reset = root.querySelector("[data-step-action='reset']");

    if (!svg || !viewport) return;

    const steps = [
      {
        label: "1. Engineer CRISPRi cells",
        text: "Cells first receive the transcriptional repressor machinery, usually dCas9-KRAB or a stronger variant.",
      },
      {
        label: "2. Deliver guide RNAs",
        text: "A pooled guide library gives each cell a perturbation identity, while control guides define the baseline.",
      },
      {
        label: "3. Repress target genes",
        text: "The guide brings dCas9-KRAB to a promoter or TSS, reducing transcription without cutting DNA.",
      },
      {
        label: "4. Capture single cells",
        text: "Cells enter droplets, where cell barcodes and UMIs label mRNA and guide-derived identifiers.",
      },
      {
        label: "5. Sequence transcriptome and guide",
        text: "Sequencing links each cell's expression profile to the guide that caused the perturbation.",
      },
      {
        label: "6. Reconstruct perturbation response",
        text: "Analysis builds a cell-by-gene matrix annotated by perturbation, then maps shifts in cell state.",
      },
    ];

    let transform = { x: 0, y: 0, k: 1 };
    let drag = null;
    let currentStep = 0;

    function applyTransform() {
      viewport.setAttribute("transform", `translate(${transform.x} ${transform.y}) scale(${transform.k})`);
      if (status) status.textContent = `${Math.round(transform.k * 100)}%`;
    }

    function setStep(index) {
      currentStep = clamp(index, 0, steps.length - 1);
      root.dataset.step = String(currentStep + 1);
      if (stepLabel) stepLabel.textContent = steps[currentStep].label;
      if (stepText) stepText.textContent = steps[currentStep].text;
      buttons.forEach((button, idx) => {
        button.classList.toggle("is-active", idx === currentStep);
        button.setAttribute("aria-pressed", idx === currentStep ? "true" : "false");
      });
    }

    function svgPoint(event) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      return point.matrixTransform(svg.getScreenCTM().inverse());
    }

    svg.addEventListener(
      "wheel",
      function (event) {
        event.preventDefault();
        const pointer = svgPoint(event);
        const direction = event.deltaY < 0 ? 1 : -1;
        const factor = direction > 0 ? 1.15 : 0.87;
        const nextK = clamp(transform.k * factor, 0.65, 4);
        const worldX = (pointer.x - transform.x) / transform.k;
        const worldY = (pointer.y - transform.y) / transform.k;
        transform.x = pointer.x - worldX * nextK;
        transform.y = pointer.y - worldY * nextK;
        transform.k = nextK;
        applyTransform();
      },
      { passive: false }
    );

    svg.addEventListener("pointerdown", function (event) {
      svg.setPointerCapture(event.pointerId);
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      root.classList.add("is-dragging");
    });

    svg.addEventListener("pointermove", function (event) {
      if (!drag || drag.id !== event.pointerId) return;
      const scale = 1000 / svg.getBoundingClientRect().width;
      transform.x += (event.clientX - drag.x) * scale;
      transform.y += (event.clientY - drag.y) * scale;
      drag.x = event.clientX;
      drag.y = event.clientY;
      applyTransform();
    });

    svg.addEventListener("pointerup", function (event) {
      if (drag && drag.id === event.pointerId) {
        drag = null;
        root.classList.remove("is-dragging");
      }
    });

    svg.addEventListener("pointercancel", function () {
      drag = null;
      root.classList.remove("is-dragging");
    });

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => setStep(index));
    });

    if (prev) prev.addEventListener("click", () => setStep(currentStep - 1));
    if (next) next.addEventListener("click", () => setStep(currentStep + 1));
    if (reset) {
      reset.addEventListener("click", () => {
        transform = { x: 0, y: 0, k: 1 };
        applyTransform();
      });
    }

    applyTransform();
    setStep(0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".perturbseq-crispri-viewer").forEach(initViewer);
  });
})();
