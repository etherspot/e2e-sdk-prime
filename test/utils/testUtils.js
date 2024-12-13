class SharedState {
  constructor() {
    this.data = {};
  }

  setValue(key, value) {
    this.data[key] = value;
  }

  getValue(key) {
    return this.data[key];
  }
}

export default new SharedState();
