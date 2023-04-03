/* eslint-disable */
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/.pnpm/uuid@3.2.1/node_modules/uuid/lib/rng-browser.js
var require_rng_browser = __commonJS({
  "node_modules/.pnpm/uuid@3.2.1/node_modules/uuid/lib/rng-browser.js"(exports, module) {
    var getRandomValues = typeof crypto != "undefined" && crypto.getRandomValues.bind(crypto) || typeof msCrypto != "undefined" && msCrypto.getRandomValues.bind(msCrypto);
    if (getRandomValues) {
      rnds8 = new Uint8Array(16);
      module.exports = /* @__PURE__ */ __name(function whatwgRNG() {
        getRandomValues(rnds8);
        return rnds8;
      }, "whatwgRNG");
    } else {
      rnds = new Array(16);
      module.exports = /* @__PURE__ */ __name(function mathRNG() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 3) === 0)
            r = Math.random() * 4294967296;
          rnds[i] = r >>> ((i & 3) << 3) & 255;
        }
        return rnds;
      }, "mathRNG");
    }
    var rnds8;
    var rnds;
  }
});

// node_modules/.pnpm/uuid@3.2.1/node_modules/uuid/lib/bytesToUuid.js
var require_bytesToUuid = __commonJS({
  "node_modules/.pnpm/uuid@3.2.1/node_modules/uuid/lib/bytesToUuid.js"(exports, module) {
    var byteToHex = [];
    for (i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 256).toString(16).substr(1);
    }
    function bytesToUuid(buf, offset) {
      var i2 = offset || 0;
      var bth = byteToHex;
      return bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + "-" + bth[buf[i2++]] + bth[buf[i2++]] + "-" + bth[buf[i2++]] + bth[buf[i2++]] + "-" + bth[buf[i2++]] + bth[buf[i2++]] + "-" + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]] + bth[buf[i2++]];
    }
    __name(bytesToUuid, "bytesToUuid");
    module.exports = bytesToUuid;
    var i;
  }
});

// node_modules/.pnpm/uuid@3.2.1/node_modules/uuid/v4.js
var require_v4 = __commonJS({
  "node_modules/.pnpm/uuid@3.2.1/node_modules/uuid/v4.js"(exports, module) {
    var rng = require_rng_browser();
    var bytesToUuid = require_bytesToUuid();
    function v4(options, buf, offset) {
      var i = buf && offset || 0;
      if (typeof options == "string") {
        buf = options === "binary" ? new Array(16) : null;
        options = null;
      }
      options = options || {};
      var rnds = options.random || (options.rng || rng)();
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      if (buf) {
        for (var ii = 0; ii < 16; ++ii) {
          buf[i + ii] = rnds[ii];
        }
      }
      return buf || bytesToUuid(rnds);
    }
    __name(v4, "v4");
    module.exports = v4;
  }
});

// utils.js
var require_utils = __commonJS({
  "utils.js"(exports) {
    exports.isDetectionTooLarge = (detections, largestAllowed) => {
      if (detections.w >= largestAllowed) {
        return true;
      } else {
        return false;
      }
    };
    var isInsideArea = /* @__PURE__ */ __name((area, point) => {
      const xMin = area.x - area.w / 2;
      const xMax = area.x + area.w / 2;
      const yMin = area.y - area.h / 2;
      const yMax = area.y + area.h / 2;
      if (point.x >= xMin && point.x <= xMax && point.y >= yMin && point.y <= yMax) {
        return true;
      } else {
        return false;
      }
    }, "isInsideArea");
    exports.isInsideArea = isInsideArea;
    exports.isInsideSomeAreas = (areas, point) => {
      const isInside = areas.some((area) => isInsideArea(area, point));
      return isInside;
    };
    exports.ignoreObjectsNotToDetect = (detections, objectsToDetect) => {
      return detections.filter((detection) => objectsToDetect.indexOf(detection.name) > -1);
    };
    var getRectangleEdges = /* @__PURE__ */ __name((item) => {
      return {
        x0: item.x - item.w / 2,
        y0: item.y - item.h / 2,
        x1: item.x + item.w / 2,
        y1: item.y + item.h / 2
      };
    }, "getRectangleEdges");
    exports.getRectangleEdges = getRectangleEdges;
    exports.iouAreas = (item1, item2) => {
      var rect1 = getRectangleEdges(item1);
      var rect2 = getRectangleEdges(item2);
      var overlap_x0 = Math.max(rect1.x0, rect2.x0);
      var overlap_y0 = Math.max(rect1.y0, rect2.y0);
      var overlap_x1 = Math.min(rect1.x1, rect2.x1);
      var overlap_y1 = Math.min(rect1.y1, rect2.y1);
      if (overlap_x1 - overlap_x0 <= 0 || overlap_y1 - overlap_y0 <= 0) {
        return 0;
      } else {
        const area_rect1 = item1.w * item1.h;
        const area_rect2 = item2.w * item2.h;
        const area_intersection = (overlap_x1 - overlap_x0) * (overlap_y1 - overlap_y0);
        const area_union = area_rect1 + area_rect2 - area_intersection;
        return area_intersection / area_union;
      }
    };
    exports.computeVelocityVector = (item1, item2, nbFrame) => {
      return {
        dx: (item2.x - item1.x) / nbFrame,
        dy: (item2.y - item1.y) / nbFrame
      };
    };
    exports.computeBearingIn360 = function(dx, dy) {
      var angle = Math.atan(dx / dy) / (Math.PI / 180);
      if (angle > 0) {
        if (dy > 0)
          return angle;
        else
          return 180 + angle;
      } else {
        if (dx > 0)
          return 180 + angle;
        else
          return 360 + angle;
      }
    };
  }
});

// ItemTracked.js
var require_ItemTracked = __commonJS({
  "ItemTracked.js"(exports) {
    var uuidv4 = require_v4();
    var computeBearingIn360 = require_utils().computeBearingIn360;
    var computeVelocityVector = require_utils().computeVelocityVector;
    exports.ITEM_HISTORY_MAX_LENGTH = 15;
    var idDisplay = 0;
    exports.ItemTracked = function(properties, frameNb, unMatchedFramesTolerance, fastDelete) {
      var DEFAULT_UNMATCHEDFRAMES_TOLERANCE = unMatchedFramesTolerance;
      var itemTracked = {};
      itemTracked.available = true;
      itemTracked.delete = false;
      itemTracked.fastDelete = fastDelete;
      itemTracked.frameUnmatchedLeftBeforeDying = unMatchedFramesTolerance;
      itemTracked.isZombie = false;
      itemTracked.appearFrame = frameNb;
      itemTracked.disappearFrame = null;
      itemTracked.disappearArea = {};
      itemTracked.nameCount = {};
      itemTracked.nameCount[properties.name] = 1;
      itemTracked.x = properties.x;
      itemTracked.y = properties.y;
      itemTracked.w = properties.w;
      itemTracked.h = properties.h;
      itemTracked.name = properties.name;
      itemTracked.confidence = properties.confidence;
      itemTracked.itemHistory = [];
      itemTracked.itemHistory.push({
        x: properties.x,
        y: properties.y,
        w: properties.w,
        h: properties.h,
        confidence: properties.confidence
      });
      if (itemTracked.itemHistory.length >= exports.ITEM_HISTORY_MAX_LENGTH) {
        itemTracked.itemHistory.shift();
      }
      itemTracked.velocity = {
        dx: 0,
        dy: 0
      };
      itemTracked.nbTimeMatched = 1;
      itemTracked.id = uuidv4();
      itemTracked.idDisplay = idDisplay;
      idDisplay++;
      itemTracked.update = function(properties2, frameNb2) {
        if (this.disappearFrame) {
          this.disappearFrame = null;
          this.disappearArea = {};
        }
        this.isZombie = false;
        this.nbTimeMatched += 1;
        this.x = properties2.x;
        this.y = properties2.y;
        this.w = properties2.w;
        this.h = properties2.h;
        this.confidence = properties2.confidence;
        this.itemHistory.push({
          x: this.x,
          y: this.y,
          w: this.w,
          h: this.h,
          confidence: this.confidence
        });
        if (itemTracked.itemHistory.length >= exports.ITEM_HISTORY_MAX_LENGTH) {
          itemTracked.itemHistory.shift();
        }
        this.name = properties2.name;
        if (this.nameCount[properties2.name]) {
          this.nameCount[properties2.name]++;
        } else {
          this.nameCount[properties2.name] = 1;
        }
        this.frameUnmatchedLeftBeforeDying = DEFAULT_UNMATCHEDFRAMES_TOLERANCE;
        this.velocity = this.updateVelocityVector();
      };
      itemTracked.makeAvailable = function() {
        this.available = true;
        return this;
      };
      itemTracked.makeUnavailable = function() {
        this.available = false;
        return this;
      };
      itemTracked.countDown = function(frameNb2) {
        if (this.disappearFrame === null) {
          this.disappearFrame = frameNb2;
          this.disappearArea = {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
          };
        }
        this.frameUnmatchedLeftBeforeDying--;
        this.isZombie = true;
        if (this.fastDelete && this.nbTimeMatched <= 1) {
          this.frameUnmatchedLeftBeforeDying = -1;
        }
      };
      itemTracked.updateTheoricalPositionAndSize = function() {
        this.itemHistory.push({
          x: this.x,
          y: this.y,
          w: this.w,
          h: this.h,
          confidence: this.confidence
        });
        if (itemTracked.itemHistory.length >= exports.ITEM_HISTORY_MAX_LENGTH) {
          itemTracked.itemHistory.shift();
        }
        this.x = this.x + this.velocity.dx;
        this.y = this.y + this.velocity.dy;
      };
      itemTracked.predictNextPosition = function() {
        return {
          x: this.x + this.velocity.dx,
          y: this.y + this.velocity.dy,
          w: this.w,
          h: this.h
        };
      };
      itemTracked.isDead = function() {
        return this.frameUnmatchedLeftBeforeDying < 0;
      };
      itemTracked.updateVelocityVector = function() {
        if (exports.ITEM_HISTORY_MAX_LENGTH <= 2) {
          return { dx: void 0, dy: void 0 };
        }
        if (this.itemHistory.length <= exports.ITEM_HISTORY_MAX_LENGTH) {
          const start = this.itemHistory[0];
          const end = this.itemHistory[this.itemHistory.length - 1];
          return computeVelocityVector(start, end, this.itemHistory.length);
        } else {
          const start = this.itemHistory[this.itemHistory.length - exports.ITEM_HISTORY_MAX_LENGTH];
          const end = this.itemHistory[this.itemHistory.length - 1];
          return computeVelocityVector(start, end, exports.ITEM_HISTORY_MAX_LENGTH);
        }
      };
      itemTracked.getMostlyMatchedName = function() {
        var nameMostlyMatchedOccurences = 0;
        var nameMostlyMatched = "";
        Object.keys(this.nameCount).map((name) => {
          if (this.nameCount[name] > nameMostlyMatchedOccurences) {
            nameMostlyMatched = name;
            nameMostlyMatchedOccurences = this.nameCount[name];
          }
        });
        return nameMostlyMatched;
      };
      itemTracked.toJSONDebug = function(roundInt = true) {
        return {
          id: this.id,
          idDisplay: this.idDisplay,
          x: roundInt ? parseInt(this.x, 10) : this.x,
          y: roundInt ? parseInt(this.y, 10) : this.y,
          w: roundInt ? parseInt(this.w, 10) : this.w,
          h: roundInt ? parseInt(this.h, 10) : this.h,
          confidence: Math.round(this.confidence * 100) / 100,
          // Here we negate dy to be in "normal" carthesian coordinates
          bearing: parseInt(computeBearingIn360(this.velocity.dx, -this.velocity.dy)),
          name: this.getMostlyMatchedName(),
          isZombie: this.isZombie,
          appearFrame: this.appearFrame,
          disappearFrame: this.disappearFrame
        };
      };
      itemTracked.toJSON = function(roundInt = true) {
        return {
          id: this.idDisplay,
          x: roundInt ? parseInt(this.x, 10) : this.x,
          y: roundInt ? parseInt(this.y, 10) : this.y,
          w: roundInt ? parseInt(this.w, 10) : this.w,
          h: roundInt ? parseInt(this.h, 10) : this.h,
          confidence: Math.round(this.confidence * 100) / 100,
          // Here we negate dy to be in "normal" carthesian coordinates
          bearing: parseInt(computeBearingIn360(this.velocity.dx, -this.velocity.dy), 10),
          name: this.getMostlyMatchedName(),
          isZombie: this.isZombie
        };
      };
      itemTracked.toMOT = function(frameIndex) {
        return `${frameIndex},${this.idDisplay},${this.x - this.w / 2},${this.y - this.h / 2},${this.w},${this.h},${this.confidence / 100},-1,-1,-1`;
      };
      itemTracked.toJSONGenericInfo = function() {
        return {
          id: this.id,
          idDisplay: this.idDisplay,
          appearFrame: this.appearFrame,
          disappearFrame: this.disappearFrame,
          disappearArea: this.disappearArea,
          nbActiveFrame: this.disappearFrame - this.appearFrame,
          name: this.getMostlyMatchedName()
        };
      };
      return itemTracked;
    };
    exports.reset = function() {
      idDisplay = 0;
    };
  }
});

// lib/kdTree-min.js
var require_kdTree_min = __commonJS({
  "lib/kdTree-min.js"(exports) {
    (function(root, factory) {
      if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
      } else if (typeof exports === "object") {
        factory(exports);
      } else {
        factory(root);
      }
    })(exports, function(exports2) {
      function Node(obj, dimension, parent) {
        this.obj = obj;
        this.left = null;
        this.right = null;
        this.parent = parent;
        this.dimension = dimension;
      }
      __name(Node, "Node");
      function kdTree(points, metric, dimensions) {
        var self = this;
        function buildTree(points2, depth, parent) {
          var dim = depth % dimensions.length, median, node;
          if (points2.length === 0) {
            return null;
          }
          if (points2.length === 1) {
            return new Node(points2[0], dim, parent);
          }
          points2.sort(function(a, b) {
            return a[dimensions[dim]] - b[dimensions[dim]];
          });
          median = Math.floor(points2.length / 2);
          node = new Node(points2[median], dim, parent);
          node.left = buildTree(points2.slice(0, median), depth + 1, node);
          node.right = buildTree(points2.slice(median + 1), depth + 1, node);
          return node;
        }
        __name(buildTree, "buildTree");
        function loadTree(data) {
          self.root = data;
          function restoreParent(root) {
            if (root.left) {
              root.left.parent = root;
              restoreParent(root.left);
            }
            if (root.right) {
              root.right.parent = root;
              restoreParent(root.right);
            }
          }
          __name(restoreParent, "restoreParent");
          restoreParent(self.root);
        }
        __name(loadTree, "loadTree");
        if (!Array.isArray(points))
          loadTree(points, metric, dimensions);
        else
          this.root = buildTree(points, 0, null);
        this.toJSON = function(src) {
          if (!src)
            src = this.root;
          var dest = new Node(src.obj, src.dimension, null);
          if (src.left)
            dest.left = self.toJSON(src.left);
          if (src.right)
            dest.right = self.toJSON(src.right);
          return dest;
        };
        this.insert = function(point) {
          function innerSearch(node, parent) {
            if (node === null) {
              return parent;
            }
            var dimension2 = dimensions[node.dimension];
            if (point[dimension2] < node.obj[dimension2]) {
              return innerSearch(node.left, node);
            } else {
              return innerSearch(node.right, node);
            }
          }
          __name(innerSearch, "innerSearch");
          var insertPosition = innerSearch(this.root, null), newNode, dimension;
          if (insertPosition === null) {
            this.root = new Node(point, 0, null);
            return;
          }
          newNode = new Node(point, (insertPosition.dimension + 1) % dimensions.length, insertPosition);
          dimension = dimensions[insertPosition.dimension];
          if (point[dimension] < insertPosition.obj[dimension]) {
            insertPosition.left = newNode;
          } else {
            insertPosition.right = newNode;
          }
        };
        this.remove = function(point) {
          var node;
          function nodeSearch(node2) {
            if (node2 === null) {
              return null;
            }
            if (node2.obj === point) {
              return node2;
            }
            var dimension = dimensions[node2.dimension];
            if (point[dimension] < node2.obj[dimension]) {
              return nodeSearch(node2.left, node2);
            } else {
              return nodeSearch(node2.right, node2);
            }
          }
          __name(nodeSearch, "nodeSearch");
          function removeNode(node2) {
            var nextNode, nextObj, pDimension;
            function findMin(node3, dim) {
              var dimension, own, left, right, min;
              if (node3 === null) {
                return null;
              }
              dimension = dimensions[dim];
              if (node3.dimension === dim) {
                if (node3.left !== null) {
                  return findMin(node3.left, dim);
                }
                return node3;
              }
              own = node3.obj[dimension];
              left = findMin(node3.left, dim);
              right = findMin(node3.right, dim);
              min = node3;
              if (left !== null && left.obj[dimension] < own) {
                min = left;
              }
              if (right !== null && right.obj[dimension] < min.obj[dimension]) {
                min = right;
              }
              return min;
            }
            __name(findMin, "findMin");
            if (node2.left === null && node2.right === null) {
              if (node2.parent === null) {
                self.root = null;
                return;
              }
              pDimension = dimensions[node2.parent.dimension];
              if (node2.obj[pDimension] < node2.parent.obj[pDimension]) {
                node2.parent.left = null;
              } else {
                node2.parent.right = null;
              }
              return;
            }
            if (node2.right !== null) {
              nextNode = findMin(node2.right, node2.dimension);
              nextObj = nextNode.obj;
              removeNode(nextNode);
              node2.obj = nextObj;
            } else {
              nextNode = findMin(node2.left, node2.dimension);
              nextObj = nextNode.obj;
              removeNode(nextNode);
              node2.right = node2.left;
              node2.left = null;
              node2.obj = nextObj;
            }
          }
          __name(removeNode, "removeNode");
          node = nodeSearch(self.root);
          if (node === null) {
            return;
          }
          removeNode(node);
        };
        this.nearest = function(point, maxNodes, maxDistance) {
          var i, result, bestNodes;
          bestNodes = new BinaryHeap(
            function(e) {
              return -e[1];
            }
          );
          function nearestSearch(node) {
            var bestChild, dimension = dimensions[node.dimension], ownDistance = metric(point, node.obj), linearPoint = {}, linearDistance, otherChild, i2;
            function saveNode(node2, distance) {
              bestNodes.push([node2, distance]);
              if (bestNodes.size() > maxNodes) {
                bestNodes.pop();
              }
            }
            __name(saveNode, "saveNode");
            for (i2 = 0; i2 < dimensions.length; i2 += 1) {
              if (i2 === node.dimension) {
                linearPoint[dimensions[i2]] = point[dimensions[i2]];
              } else {
                linearPoint[dimensions[i2]] = node.obj[dimensions[i2]];
              }
            }
            linearDistance = metric(linearPoint, node.obj);
            if (node.right === null && node.left === null) {
              if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                saveNode(node, ownDistance);
              }
              return;
            }
            if (node.right === null) {
              bestChild = node.left;
            } else if (node.left === null) {
              bestChild = node.right;
            } else {
              if (point[dimension] < node.obj[dimension]) {
                bestChild = node.left;
              } else {
                bestChild = node.right;
              }
            }
            nearestSearch(bestChild);
            if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
              saveNode(node, ownDistance);
            }
            if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
              if (bestChild === node.left) {
                otherChild = node.right;
              } else {
                otherChild = node.left;
              }
              if (otherChild !== null) {
                nearestSearch(otherChild);
              }
            }
          }
          __name(nearestSearch, "nearestSearch");
          if (maxDistance) {
            for (i = 0; i < maxNodes; i += 1) {
              bestNodes.push([null, maxDistance]);
            }
          }
          if (self.root)
            nearestSearch(self.root);
          result = [];
          for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
            if (bestNodes.content[i][0]) {
              result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
            }
          }
          return result;
        };
        this.balanceFactor = function() {
          function height(node) {
            if (node === null) {
              return 0;
            }
            return Math.max(height(node.left), height(node.right)) + 1;
          }
          __name(height, "height");
          function count(node) {
            if (node === null) {
              return 0;
            }
            return count(node.left) + count(node.right) + 1;
          }
          __name(count, "count");
          return height(self.root) / (Math.log(count(self.root)) / Math.log(2));
        };
      }
      __name(kdTree, "kdTree");
      function BinaryHeap(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
      }
      __name(BinaryHeap, "BinaryHeap");
      BinaryHeap.prototype = {
        push: function(element) {
          this.content.push(element);
          this.bubbleUp(this.content.length - 1);
        },
        pop: function() {
          var result = this.content[0];
          var end = this.content.pop();
          if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
          }
          return result;
        },
        peek: function() {
          return this.content[0];
        },
        remove: function(node) {
          var len = this.content.length;
          for (var i = 0; i < len; i++) {
            if (this.content[i] == node) {
              var end = this.content.pop();
              if (i != len - 1) {
                this.content[i] = end;
                if (this.scoreFunction(end) < this.scoreFunction(node))
                  this.bubbleUp(i);
                else
                  this.sinkDown(i);
              }
              return;
            }
          }
          throw new Error("Node not found.");
        },
        size: function() {
          return this.content.length;
        },
        bubbleUp: function(n) {
          var element = this.content[n];
          while (n > 0) {
            var parentN = Math.floor((n + 1) / 2) - 1, parent = this.content[parentN];
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
              this.content[parentN] = element;
              this.content[n] = parent;
              n = parentN;
            } else {
              break;
            }
          }
        },
        sinkDown: function(n) {
          var length = this.content.length, element = this.content[n], elemScore = this.scoreFunction(element);
          while (true) {
            var child2N = (n + 1) * 2, child1N = child2N - 1;
            var swap = null;
            if (child1N < length) {
              var child1 = this.content[child1N], child1Score = this.scoreFunction(child1);
              if (child1Score < elemScore)
                swap = child1N;
            }
            if (child2N < length) {
              var child2 = this.content[child2N], child2Score = this.scoreFunction(child2);
              if (child2Score < (swap == null ? elemScore : child1Score)) {
                swap = child2N;
              }
            }
            if (swap != null) {
              this.content[n] = this.content[swap];
              this.content[swap] = element;
              n = swap;
            } else {
              break;
            }
          }
        }
      };
      exports2.kdTree = kdTree;
      exports2.BinaryHeap = BinaryHeap;
    });
  }
});

// node_modules/.pnpm/munkres-js@1.2.2/node_modules/munkres-js/munkres.js
var require_munkres = __commonJS({
  "node_modules/.pnpm/munkres-js@1.2.2/node_modules/munkres-js/munkres.js"(exports, module) {
    var MAX_SIZE = parseInt(Number.MAX_SAFE_INTEGER / 2) || (1 << 26) * (1 << 26);
    var DEFAULT_PAD_VALUE = 0;
    function Munkres() {
      this.C = null;
      this.row_covered = [];
      this.col_covered = [];
      this.n = 0;
      this.Z0_r = 0;
      this.Z0_c = 0;
      this.marked = null;
      this.path = null;
    }
    __name(Munkres, "Munkres");
    Munkres.prototype.pad_matrix = function(matrix, pad_value) {
      pad_value = pad_value || DEFAULT_PAD_VALUE;
      var max_columns = 0;
      var total_rows = matrix.length;
      var i;
      for (i = 0; i < total_rows; ++i)
        if (matrix[i].length > max_columns)
          max_columns = matrix[i].length;
      total_rows = max_columns > total_rows ? max_columns : total_rows;
      var new_matrix = [];
      for (i = 0; i < total_rows; ++i) {
        var row = matrix[i] || [];
        var new_row = row.slice();
        while (total_rows > new_row.length)
          new_row.push(pad_value);
        new_matrix.push(new_row);
      }
      return new_matrix;
    };
    Munkres.prototype.compute = function(cost_matrix, options) {
      options = options || {};
      options.padValue = options.padValue || DEFAULT_PAD_VALUE;
      this.C = this.pad_matrix(cost_matrix, options.padValue);
      this.n = this.C.length;
      this.original_length = cost_matrix.length;
      this.original_width = cost_matrix[0].length;
      var nfalseArray = [];
      while (nfalseArray.length < this.n)
        nfalseArray.push(false);
      this.row_covered = nfalseArray.slice();
      this.col_covered = nfalseArray.slice();
      this.Z0_r = 0;
      this.Z0_c = 0;
      this.path = this.__make_matrix(this.n * 2, 0);
      this.marked = this.__make_matrix(this.n, 0);
      var step = 1;
      var steps = {
        1: this.__step1,
        2: this.__step2,
        3: this.__step3,
        4: this.__step4,
        5: this.__step5,
        6: this.__step6
      };
      while (true) {
        var func = steps[step];
        if (!func)
          break;
        step = func.apply(this);
      }
      var results = [];
      for (var i = 0; i < this.original_length; ++i)
        for (var j = 0; j < this.original_width; ++j)
          if (this.marked[i][j] == 1)
            results.push([i, j]);
      return results;
    };
    Munkres.prototype.__make_matrix = function(n, val) {
      var matrix = [];
      for (var i = 0; i < n; ++i) {
        matrix[i] = [];
        for (var j = 0; j < n; ++j)
          matrix[i][j] = val;
      }
      return matrix;
    };
    Munkres.prototype.__step1 = function() {
      for (var i = 0; i < this.n; ++i) {
        var minval = Math.min.apply(Math, this.C[i]);
        for (var j = 0; j < this.n; ++j)
          this.C[i][j] -= minval;
      }
      return 2;
    };
    Munkres.prototype.__step2 = function() {
      for (var i = 0; i < this.n; ++i) {
        for (var j = 0; j < this.n; ++j) {
          if (this.C[i][j] === 0 && !this.col_covered[j] && !this.row_covered[i]) {
            this.marked[i][j] = 1;
            this.col_covered[j] = true;
            this.row_covered[i] = true;
            break;
          }
        }
      }
      this.__clear_covers();
      return 3;
    };
    Munkres.prototype.__step3 = function() {
      var count = 0;
      for (var i = 0; i < this.n; ++i) {
        for (var j = 0; j < this.n; ++j) {
          if (this.marked[i][j] == 1 && this.col_covered[j] == false) {
            this.col_covered[j] = true;
            ++count;
          }
        }
      }
      return count >= this.n ? 7 : 4;
    };
    Munkres.prototype.__step4 = function() {
      var done = false;
      var row = -1, col = -1, star_col = -1;
      while (!done) {
        var z = this.__find_a_zero();
        row = z[0];
        col = z[1];
        if (row < 0)
          return 6;
        this.marked[row][col] = 2;
        star_col = this.__find_star_in_row(row);
        if (star_col >= 0) {
          col = star_col;
          this.row_covered[row] = true;
          this.col_covered[col] = false;
        } else {
          this.Z0_r = row;
          this.Z0_c = col;
          return 5;
        }
      }
    };
    Munkres.prototype.__step5 = function() {
      var count = 0;
      this.path[count][0] = this.Z0_r;
      this.path[count][1] = this.Z0_c;
      var done = false;
      while (!done) {
        var row = this.__find_star_in_col(this.path[count][1]);
        if (row >= 0) {
          count++;
          this.path[count][0] = row;
          this.path[count][1] = this.path[count - 1][1];
        } else {
          done = true;
        }
        if (!done) {
          var col = this.__find_prime_in_row(this.path[count][0]);
          count++;
          this.path[count][0] = this.path[count - 1][0];
          this.path[count][1] = col;
        }
      }
      this.__convert_path(this.path, count);
      this.__clear_covers();
      this.__erase_primes();
      return 3;
    };
    Munkres.prototype.__step6 = function() {
      var minval = this.__find_smallest();
      for (var i = 0; i < this.n; ++i) {
        for (var j = 0; j < this.n; ++j) {
          if (this.row_covered[i])
            this.C[i][j] += minval;
          if (!this.col_covered[j])
            this.C[i][j] -= minval;
        }
      }
      return 4;
    };
    Munkres.prototype.__find_smallest = function() {
      var minval = MAX_SIZE;
      for (var i = 0; i < this.n; ++i)
        for (var j = 0; j < this.n; ++j)
          if (!this.row_covered[i] && !this.col_covered[j]) {
            if (minval > this.C[i][j])
              minval = this.C[i][j];
          }
      return minval;
    };
    Munkres.prototype.__find_a_zero = function() {
      for (var i = 0; i < this.n; ++i)
        for (var j = 0; j < this.n; ++j)
          if (this.C[i][j] === 0 && !this.row_covered[i] && !this.col_covered[j])
            return [i, j];
      return [-1, -1];
    };
    Munkres.prototype.__find_star_in_row = function(row) {
      for (var j = 0; j < this.n; ++j)
        if (this.marked[row][j] == 1)
          return j;
      return -1;
    };
    Munkres.prototype.__find_star_in_col = function(col) {
      for (var i = 0; i < this.n; ++i)
        if (this.marked[i][col] == 1)
          return i;
      return -1;
    };
    Munkres.prototype.__find_prime_in_row = function(row) {
      for (var j = 0; j < this.n; ++j)
        if (this.marked[row][j] == 2)
          return j;
      return -1;
    };
    Munkres.prototype.__convert_path = function(path, count) {
      for (var i = 0; i <= count; ++i)
        this.marked[path[i][0]][path[i][1]] = this.marked[path[i][0]][path[i][1]] == 1 ? 0 : 1;
    };
    Munkres.prototype.__clear_covers = function() {
      for (var i = 0; i < this.n; ++i) {
        this.row_covered[i] = false;
        this.col_covered[i] = false;
      }
    };
    Munkres.prototype.__erase_primes = function() {
      for (var i = 0; i < this.n; ++i)
        for (var j = 0; j < this.n; ++j)
          if (this.marked[i][j] == 2)
            this.marked[i][j] = 0;
    };
    function make_cost_matrix(profit_matrix, inversion_function) {
      var i, j;
      if (!inversion_function) {
        var maximum = -1 / 0;
        for (i = 0; i < profit_matrix.length; ++i)
          for (j = 0; j < profit_matrix[i].length; ++j)
            if (profit_matrix[i][j] > maximum)
              maximum = profit_matrix[i][j];
        inversion_function = /* @__PURE__ */ __name(function(x) {
          return maximum - x;
        }, "inversion_function");
      }
      var cost_matrix = [];
      for (i = 0; i < profit_matrix.length; ++i) {
        var row = profit_matrix[i];
        cost_matrix[i] = [];
        for (j = 0; j < row.length; ++j)
          cost_matrix[i][j] = inversion_function(profit_matrix[i][j]);
      }
      return cost_matrix;
    }
    __name(make_cost_matrix, "make_cost_matrix");
    function format_matrix(matrix) {
      var columnWidths = [];
      var i, j;
      for (i = 0; i < matrix.length; ++i) {
        for (j = 0; j < matrix[i].length; ++j) {
          var entryWidth = String(matrix[i][j]).length;
          if (!columnWidths[j] || entryWidth >= columnWidths[j])
            columnWidths[j] = entryWidth;
        }
      }
      var formatted = "";
      for (i = 0; i < matrix.length; ++i) {
        for (j = 0; j < matrix[i].length; ++j) {
          var s = String(matrix[i][j]);
          while (s.length < columnWidths[j])
            s = " " + s;
          formatted += s;
          if (j != matrix[i].length - 1)
            formatted += " ";
        }
        if (i != matrix[i].length - 1)
          formatted += "\n";
      }
      return formatted;
    }
    __name(format_matrix, "format_matrix");
    function computeMunkres(cost_matrix, options) {
      var m = new Munkres();
      return m.compute(cost_matrix, options);
    }
    __name(computeMunkres, "computeMunkres");
    computeMunkres.version = "1.2.2";
    computeMunkres.format_matrix = format_matrix;
    computeMunkres.make_cost_matrix = make_cost_matrix;
    computeMunkres.Munkres = Munkres;
    if (typeof module !== "undefined" && module.exports) {
      module.exports = computeMunkres;
    }
  }
});

// tracker.js
var require_tracker = __commonJS({
  "tracker.js"(exports) {
    var itemTrackedModule = require_ItemTracked();
    var ItemTracked = itemTrackedModule.ItemTracked;
    var kdTree = require_kdTree_min().kdTree;
    var iouAreas = require_utils().iouAreas;
    var munkres = require_munkres();
    var DEBUG_MODE = false;
    var iouDistance = /* @__PURE__ */ __name(function(item1, item2) {
      var iou = iouAreas(item1, item2);
      var distance = 1 - iou;
      if (distance > 1 - params.iouLimit) {
        distance = params.distanceLimit + 1;
      }
      return distance;
    }, "iouDistance");
    var params = {
      // DEFAULT_UNMATCHEDFRAMES_TOLERANCE
      // This the number of frame we wait when an object isn't matched before considering it gone
      unMatchedFramesTolerance: 5,
      // DEFAULT_IOU_LIMIT, exclude things from beeing matched if their IOU is lower than this
      // 1 means total overlap whereas 0 means no overlap
      iouLimit: 0.05,
      // Remove new objects fast if they could not be matched in the next frames.
      // Setting this to false ensures the object will stick around at least
      // unMatchedFramesTolerance frames, even if they could neven be matched in
      // subsequent frames.
      fastDelete: true,
      // The function to use to determine the distance between to detected objects
      distanceFunc: iouDistance,
      // The distance limit for matching. If values need to be excluded from
      // matching set their distance to something greater than the distance limit
      distanceLimit: 1e4,
      // The algorithm used to match tracks with new detections. Can be either
      // 'kdTree' or 'munkres'.
      matchingAlgorithm: "kdTree"
    };
    var mapOfItemsTracked = /* @__PURE__ */ new Map();
    var mapOfAllItemsTracked = /* @__PURE__ */ new Map();
    var keepAllHistoryInMemory = false;
    exports.computeDistance = iouDistance;
    exports.updateTrackedItemsWithNewFrame = function(detectionsOfThisFrame, frameNb) {
      var treeItemsTracked = new kdTree(Array.from(mapOfItemsTracked.values()), params.distanceFunc, ["x", "y", "w", "h"]);
      var treeDetectionsOfThisFrame = new kdTree(detectionsOfThisFrame, params.distanceFunc, ["x", "y", "w", "h"]);
      if (mapOfItemsTracked.size === 0) {
        detectionsOfThisFrame.forEach(function(itemDetected) {
          var newItemTracked = new ItemTracked(itemDetected, frameNb, params.unMatchedFramesTolerance, params.fastDelete);
          mapOfItemsTracked.set(newItemTracked.id, newItemTracked);
          treeItemsTracked.insert(newItemTracked);
        });
      } else {
        var matchedList = new Array(detectionsOfThisFrame.length);
        matchedList.fill(false);
        if (detectionsOfThisFrame.length > 0) {
          if (params.matchingAlgorithm === "munkres") {
            var trackedItemIds = Array.from(mapOfItemsTracked.keys());
            var costMatrix = Array.from(mapOfItemsTracked.values()).map((itemTracked) => {
              var predictedPosition = itemTracked.predictNextPosition();
              return detectionsOfThisFrame.map(
                (detection) => params.distanceFunc(predictedPosition, detection)
              );
            });
            mapOfItemsTracked.forEach(function(itemTracked) {
              itemTracked.makeAvailable();
            });
            munkres(costMatrix).filter((m) => costMatrix[m[0]][m[1]] <= params.distanceLimit).forEach((m) => {
              var itemTracked = mapOfItemsTracked.get(trackedItemIds[m[0]]);
              var updatedTrackedItemProperties = detectionsOfThisFrame[m[1]];
              matchedList[m[1]] = { idDisplay: itemTracked.idDisplay };
              itemTracked.makeUnavailable().update(updatedTrackedItemProperties, frameNb);
            });
            matchedList.forEach(function(matched, index) {
              if (!matched) {
                if (Math.min(...costMatrix.map((m) => m[index])) > params.distanceLimit) {
                  var newItemTracked = ItemTracked(detectionsOfThisFrame[index], frameNb, params.unMatchedFramesTolerance, params.fastDelete);
                  mapOfItemsTracked.set(newItemTracked.id, newItemTracked);
                  newItemTracked.makeUnavailable();
                  costMatrix.push(detectionsOfThisFrame.map(
                    (detection) => params.distanceFunc(newItemTracked, detection)
                  ));
                }
              }
            });
          } else if (params.matchingAlgorithm === "kdTree") {
            mapOfItemsTracked.forEach(function(itemTracked) {
              var predictedPosition = itemTracked.predictNextPosition();
              itemTracked.makeAvailable();
              var treeSearchResult = treeDetectionsOfThisFrame.nearest(predictedPosition, 1, params.distanceLimit)[0];
              var treeSearchResultWithoutPrediction = treeDetectionsOfThisFrame.nearest(itemTracked, 1, params.distanceLimit)[0];
              var treeSearchMultipleResults = treeDetectionsOfThisFrame.nearest(predictedPosition, 2, params.distanceLimit);
              if (treeSearchResult) {
                var indexClosestNewDetectedItem = detectionsOfThisFrame.indexOf(treeSearchResult[0]);
                if (!matchedList[indexClosestNewDetectedItem]) {
                  matchedList[indexClosestNewDetectedItem] = {
                    idDisplay: itemTracked.idDisplay
                  };
                  var updatedTrackedItemProperties = detectionsOfThisFrame[indexClosestNewDetectedItem];
                  mapOfItemsTracked.get(itemTracked.id).makeUnavailable().update(updatedTrackedItemProperties, frameNb);
                } else {
                }
              }
            });
          } else {
            throw `Unknown matching algorithm "${params.matchingAlgorithm}"`;
          }
        } else {
          if (DEBUG_MODE) {
            console.log("[Tracker] Nothing detected for frame n\xBA" + frameNb);
          }
          mapOfItemsTracked.forEach(function(itemTracked) {
            itemTracked.makeAvailable();
          });
        }
        if (params.matchingAlgorithm === "kdTree") {
          if (mapOfItemsTracked.size > 0) {
            treeItemsTracked = new kdTree(Array.from(mapOfItemsTracked.values()), params.distanceFunc, ["x", "y", "w", "h"]);
            matchedList.forEach(function(matched, index) {
              if (!matched) {
                var treeSearchResult = treeItemsTracked.nearest(detectionsOfThisFrame[index], 1, params.distanceLimit)[0];
                if (!treeSearchResult) {
                  var newItemTracked = ItemTracked(detectionsOfThisFrame[index], frameNb, params.unMatchedFramesTolerance, params.fastDelete);
                  mapOfItemsTracked.set(newItemTracked.id, newItemTracked);
                  treeItemsTracked.insert(newItemTracked);
                  newItemTracked.makeUnavailable();
                } else {
                }
              }
            });
          }
        }
        mapOfItemsTracked.forEach(function(itemTracked) {
          if (itemTracked.available) {
            itemTracked.countDown(frameNb);
            itemTracked.updateTheoricalPositionAndSize();
            if (itemTracked.isDead()) {
              mapOfItemsTracked.delete(itemTracked.id);
              treeItemsTracked.remove(itemTracked);
              if (keepAllHistoryInMemory) {
                mapOfAllItemsTracked.set(itemTracked.id, itemTracked);
              }
            }
          }
        });
      }
    };
    exports.reset = function() {
      mapOfItemsTracked = /* @__PURE__ */ new Map();
      mapOfAllItemsTracked = /* @__PURE__ */ new Map();
      itemTrackedModule.reset();
    };
    exports.setParams = function(newParams) {
      Object.keys(newParams).forEach((key) => {
        params[key] = newParams[key];
      });
    };
    exports.enableKeepInMemory = function() {
      keepAllHistoryInMemory = true;
    };
    exports.disableKeepInMemory = function() {
      keepAllHistoryInMemory = false;
    };
    exports.getJSONOfTrackedItems = function(roundInt = true) {
      return Array.from(mapOfItemsTracked.values()).map(function(itemTracked) {
        return itemTracked.toJSON(roundInt);
      });
    };
    exports.getJSONDebugOfTrackedItems = function(roundInt = true) {
      return Array.from(mapOfItemsTracked.values()).map(function(itemTracked) {
        return itemTracked.toJSONDebug(roundInt);
      });
    };
    exports.getTrackedItemsInMOTFormat = function(frameNb) {
      return Array.from(mapOfItemsTracked.values()).map(function(itemTracked) {
        return itemTracked.toMOT(frameNb);
      });
    };
    exports.getAllTrackedItems = function() {
      return mapOfAllItemsTracked;
    };
    exports.getJSONOfAllTrackedItems = function() {
      return Array.from(mapOfAllItemsTracked.values()).map(function(itemTracked) {
        return itemTracked.toJSONGenericInfo();
      });
    };
  }
});
export default require_tracker();
/**
 * k-d Tree JavaScript - V 1.01
 *
 * https://github.com/ubilabs/kd-tree-javascript
 *
 * @author Mircea Pricop <pricop@ubilabs.net>, 2012
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
