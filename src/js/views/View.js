import icons from "url:../../img/icons.svg";

export default class View {
  _data;
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();
    if (!render) return markup;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll("*"));
    const currentElements = Array.from(this._parentElement.querySelectorAll("*"));

    newElements.forEach((newElementItem, index) => {
      const currentElementItem = currentElements[index];

      // updates changed text
      if (!newElementItem.isEqualNode(currentElementItem) && newElementItem.firstChild?.nodeValue.trim() !== "") {
        currentElementItem.textContent = newElementItem.textContent;
      }

      // update changed attributes
      if (!newElementItem.isEqualNode(currentElementItem)) {
        Array.from(newElementItem.attributes).forEach((attribute) => currentElementItem.setAttribute(attribute.name, attribute.value));
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = "";
  }

  renderSpinner() {
    const spinnerMarkup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", spinnerMarkup);
  }

  renderError(message = this._errorMessage) {
    const errorMarkup = `
    <div class="error">
    <div>
      <svg>
        <use href="${icons}#icon-alert-triangle"></use>
      </svg>
    </div>
    <p>${message}</p>
  </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", errorMarkup);
  }

  renderMessage(message = this._message) {
    const errorMarkup = `
    <div class="message">
    <div>
      <svg>
        <use href="${icons}#icon-smile"></use>
      </svg>
    </div>
    <p>${message}</p>
  </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", errorMarkup);
  }
}
