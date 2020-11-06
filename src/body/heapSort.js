// algorithm based on Coursera Lecture from Algorithms, Part 1: https://www.coursera.org/learn/algorithms-part1/lecture/ZjoSM/heapsort
function half(k) {
  return Math.floor(k / 2);
}
class MaxHeap {
  constructor(maxSize, getElementValue) {
    this.priorityQueue = new Array(maxSize);
    this.numberOfElements = -1;
    this.getElementValue = getElementValue;
  }

  enqueue(x) {
    this.priorityQueue[++this.numberOfElements] = x;
    this.swim(this.numberOfElements);
  }

  dequeue() {
    const max = this.priorityQueue[0];
    this.exchange(0, this.numberOfElements--);
    this.sink(0);
    this.priorityQueue[this.numberOfElements + 1] = null;
    return max;
  }

  empty() {
    return this.numberOfElements === -1;
  }

  size() {
    return this.numberOfElements + 1;
  }

  all() {
    return this.priorityQueue.slice(0, this.numberOfElements + 1);
  }

  max() {
    return this.priorityQueue[0];
  }

  swim(k) {
    while (k > 0 && this.less(half(k), k)) {
      this.exchange(k, half(k));
      k = half(k);
    }
  }

  sink(k) {
    while (2 * k <= this.numberOfElements) {
      let j = 2 * k;
      if (j < this.numberOfElements && this.less(j, j + 1)) j++;
      if (!this.less(k, j)) break;
      this.exchange(k, j);
      k = j;
    }
  }

  getValueAt(i) {
    return this.getElementValue(this.priorityQueue[i]);
  }

  less(i, j) {
    return this.getValueAt(i) < this.getValueAt(j);
  }

  exchange(i, j) {
    const t = this.priorityQueue[i];
    this.priorityQueue[i] = this.priorityQueue[j];
    this.priorityQueue[j] = t;
  }
}
exports.MaxHeap = MaxHeap;
