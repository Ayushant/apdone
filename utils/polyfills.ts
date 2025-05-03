if (!Array.prototype.findLast) {
  Array.prototype.findLast = function(predicate: (value: any, index: number, obj: any[]) => boolean): any {
    if (this == null) {
      throw new TypeError('Array.prototype.findLast called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    const array = Object(this);
    let rightIndex = array.length - 1;

    while (rightIndex >= 0) {
      const value = array[rightIndex];
      if (predicate(value, rightIndex, array)) {
        return value;
      }
      rightIndex--;
    }

    return undefined;
  };
}