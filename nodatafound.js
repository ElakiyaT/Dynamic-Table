class NoDataFound {
    constructor(message = "No Data Found") {
      this.element = document.createElement('div');
      this.element.className = 'no-data-message';
      this.element.textContent = message;
      this.applyStyles();
    }
  
    applyStyles() {
      this.element.style.padding = '20px';
      this.element.style.textAlign = 'center';
      this.element.style.color = '#999';
      this.element.style.fontWeight = 'bold';
      this.element.style.fontSize = '16px';
    }
  
    getElement() {
      return this.element;
    }
  }
  
  export { NoDataFound };
  