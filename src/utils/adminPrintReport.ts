/**
 * Triggers the shared index.css print engine (#print-root + body.is-printing)
 * so any active AdminDashboard testimonial or data view prints cleanly on A4 pages.
 */
export function triggerAdminPrintReport(preferredSourceIds: string[]): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }

  let sourceEl: HTMLElement | null = null;
  for (const id of preferredSourceIds) {
    const candidate = document.getElementById(id);
    if (candidate) {
      sourceEl = candidate;
      break;
    }
  }

  if (!sourceEl) {
    return false;
  }

  let printRoot = document.getElementById("print-root");
  if (!printRoot) {
    printRoot = document.createElement("div");
    printRoot.id = "print-root";
    document.body.appendChild(printRoot);
  }
  printRoot.innerHTML = "";

  const pageNodes = sourceEl.querySelectorAll(":scope > .print-page");

  if (pageNodes.length > 0) {
    pageNodes.forEach((pageNode) => {
      const pageClone = pageNode.cloneNode(true) as HTMLElement;
      pageClone.querySelectorAll(".print\\:hidden").forEach((el) => el.remove());
      printRoot!.appendChild(pageClone);
    });
  } else {
    const pageDiv = document.createElement("div");
    pageDiv.className = "print-page";

    const clone = sourceEl.cloneNode(true) as HTMLElement;
    clone.classList.remove("hidden");
    clone.removeAttribute("aria-hidden");
    if (sourceEl.id === "printable-document-area" || sourceEl.id === "printable-proposal-calc-area") {
      clone.id = "printable-document-area-clone";
    } else {
      clone.classList.add("printable-page-clone");
    }
    clone.querySelectorAll(".print\\:hidden").forEach((el) => el.remove());

    pageDiv.appendChild(clone);
    printRoot.appendChild(pageDiv);
  }

  document.body.classList.add("is-printing");

  setTimeout(() => {
    try {
      window.print();
    } finally {
      document.body.classList.remove("is-printing");
      if (printRoot) {
        printRoot.innerHTML = "";
      }
    }
  }, 150);

  return true;
}
