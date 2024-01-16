export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export type JSONObj = { [x: string]: JSONValue | undefined };

class JSONTree {
  private _ignoreProperties: string[] = ['_hash'];
  private _root: JSONValue = {};
  isPremitive(value: unknown): value is string | number | boolean {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }
  notPremitive(value: unknown): value is JSONObj {
    return !this.isPremitive(value);
  }
  resolvePath(path: string) {
    return path.split(/[\\/]/);
  }
  add(path: string, value?: JSONValue) {
    const pathes = this.resolvePath(path);
    const dest = pathes[pathes.length - 1];

    if (!pathes.length || this._ignoreProperties.includes(dest)) {
      return;
    }

    let currPos = this._root;
    for (let i = 0; i < pathes.length - 1; i++) {
      const currPath = pathes[i];
      if (this.notPremitive(currPos)) {
        if (!currPos[currPath]) {
          currPos[currPath] = {};
        }
        currPos = currPos[currPath];
      }
    }
    if (this.notPremitive(currPos) && value !== undefined && value !== null) {
      currPos[dest] = value;
    }
    return this;
  }
  get value() {
    return this._root;
  }
}

export function hasValue(field: string, obj: unknown): obj is JSONObj {
  return typeof obj === 'object' && obj !== null && field in obj;
}

export default JSONTree;
