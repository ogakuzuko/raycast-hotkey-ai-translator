export class NoTextSelectedError extends Error {
  constructor(message = "No text selected.") {
    super(message);
    this.name = "NoTextSelectedError";
  }
}
