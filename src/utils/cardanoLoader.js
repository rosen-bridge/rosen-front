class cardanoLoader {
    constructor() {
        this.wasm = null;
    }

    async load() {
        if (this.wasm == null) {
            this.wasm = await import("@emurgo/cardano-serialization-lib-browser");
        }
        return this.wasm;
    }
}

export default new cardanoLoader();
