class TabContainerElement extends HTMLElement {
  /** @type {TabElement} */
  _activeTab = null;

  _elements = {
    /** @type {{element: TabElement, id: string}[]} */
    tabs: [],
    style: null,

    container: null,
    tabContainer: null,
    bodyContainer: null,
  };

  constructor() {
    super();

    this._elements.style = document.createElement('style');
    this._elements.style.textContent = `
@import url('/src/page/index.css');

.container {
  background-color: var(--active-color);
  border: 1px solid var(--text-color);
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 10px;
}

.tab-container {
  border-bottom: 1px solid var(--text-color);
  margin-bottom: 10px;
}
`;

    this._elements.container = document.createElement('div');
    this._elements.container.classList.add('container');

    this._elements.tabContainer = document.createElement('div');
    this._elements.tabContainer.classList.add('tab-container');
    this._elements.container.append(this._elements.tabContainer);

    this._elements.bodyContainer = document.createElement('div');
    this._elements.bodyContainer.classList.add('body-container');
    this._elements.container.append(this._elements.bodyContainer);

    while (this.children.length > 0) {
      const child = this.children[0];
      child.remove();

      if (child instanceof TabElement) {
        this._elements.tabs.push({element: child, id: child.id});
        child.id = null;
        child.attach(this._elements.tabContainer, this._elements.bodyContainer);
        child.deactivate();

        child.addEventListener('click', () => this._setActiveTab(child));

        if (child.hasAttribute('active')) {
          this._setActiveTab(child);
        }
      }
    }

    if (this._activeTab == null) {
      this._setActiveTab(this._elements.tabs[0].element);
    }

    this.attachShadow({mode: 'closed'}).append(this._elements.style, this._elements.container);
  }

  /** @param {TabElement} activeTab */
  _setActiveTab(activeTab) {
    if (this._activeTab) {
      this._activeTab.deactivate();
    }

    this._activeTab = activeTab;
    this._activeTab.activate();
  }

  /** @param {string} id */
  getTab(id) {
    for (const tab of this._elements.tabs) {
      if (tab.id === id) {
        return tab.element;
      }
    }

    return null;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('tab-container', TabContainerElement));