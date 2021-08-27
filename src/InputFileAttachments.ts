import filesize from "filesize";

const inputsMap = new Map<HTMLElement, InputFileAttachments>();

export class InputFileAttachments {
  private tempDiv: HTMLDivElement;
  private attachmentHTML: string | null = null;
  private attachments: Element[] = [];
  private maxFiles: number = -1;

  constructor(private element: HTMLElement) {
    this.tempDiv = document.createElement("div");
    const initialAttachemntElement = this.element.querySelector<HTMLElement>(
      `[data-file-attachment]`,
    );

    const maxFilesCount = parseInt(
      this.element.getAttribute("data-max-files-count") || "0",
    );

    if (isNaN(maxFilesCount) === false) {
      this.maxFiles = maxFilesCount;
    }

    if (initialAttachemntElement) {
      this.attachments.push(initialAttachemntElement);
      this.attachmentHTML = initialAttachemntElement.outerHTML;
      this.initAttachment(initialAttachemntElement);
    }

    inputsMap.set(element, this);
  }

  private initAttachment(attachment: Element) {
    const input = attachment.querySelector<HTMLInputElement>(
      "[data-attachment-input]",
    );
    const attachmentName = attachment.querySelector("[data-attachment-name]");
    const attachmentSize = attachment.querySelector("[data-attachment-size]");
    const attachmentRemove = attachment.querySelector(
      "[data-attachment-remove]",
    );
    const attachmentError =
      attachment.querySelector<HTMLElement>(".input-error");
    const maxFileSize = parseInt(
      attachment.getAttribute("data-max-file-size") || "0",
    );

    if (input) {
      input.addEventListener("change", () => {
        if (input.files !== null && input.files.length > 0) {
          const file = input.files[0];

          if (file.size <= maxFileSize) {
            if (attachmentName !== null) {
              attachmentName.innerHTML = file.name;
            }

            if (attachmentSize !== null) {
              const size = filesize.partial({ standard: "jedec" });
              attachmentSize.innerHTML = size(file.size);
            }

            if (attachmentError !== null) {
              attachment.classList.remove("is-error");
            }

            this.saveAttachment(attachment);

            if (this.attachments.length < this.maxFiles) {
              this.createNextAttachment();
            }
          } else {
            input.value = "";
            attachment.classList.add("is-error");
          }
        }
      });
    }

    if (attachmentRemove !== null) {
      attachmentRemove.addEventListener("click", () => {
        const isMaxCount = this.attachments.length === this.maxFiles;

        this.attachments = this.attachments.filter((at) => at !== attachment);

        attachment.parentElement?.removeChild(attachment);

        const isEmptyAttachment = this.attachments.some(
          (attachment) =>
            attachment.classList.contains("is-selected") === false,
        );

        if (isMaxCount && isEmptyAttachment === false) {
          this.createNextAttachment();
        }
      });
    }
  }

  private saveAttachment(attachment: Element) {
    attachment.classList.add("is-selected");
  }

  private createNextAttachment() {
    if (this.attachmentHTML !== null) {
      this.tempDiv.innerHTML = this.attachmentHTML;

      if (this.tempDiv.children[0] !== undefined) {
        const attachment = this.tempDiv.children[0];
        this.element.appendChild(attachment);
        this.initAttachment(attachment);
        this.attachments.push(attachment);
      }
    }
  }

  static create(element: HTMLElement): InputFileAttachments {
    const instance = inputsMap.get(element);

    if (instance !== undefined) {
      return instance;
    }

    return new InputFileAttachments(element);
  }

  static initAllAvailableOnPage(): InputFileAttachments[] {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(`[data-input-file-attachment]`),
    );

    return elements.map(InputFileAttachments.create);
  }
}
