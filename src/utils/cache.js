/**
 * LRU (Least Recently Used) in-memory cache
 * Stacks Development (SD)
 */

export class LRUCache {
  /**
   * @param {object} [options={}]
   * @param {number} [options.max=100] - Maximum number of entries
   * @param {number} [options.ttl=0] - Time to live in milliseconds (0 = infinite)
   */
  constructor(options = {}) {
    this.max = options.max || 100;
    this.ttl = options.ttl || 0;
    this.cache = new Map();
  }

  /**
   * Get an item from the cache
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    if (!this.cache.has(key)) return undefined;

    const entry = this.cache.get(key);

    // Check expiration
    if (this.ttl > 0 && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Refresh position to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Put an item into the cache
   * @param {string} key
   * @param {any} value
   * @param {number} [ttl] - Custom TTL in ms
   */
  set(key, value, ttl = this.ttl) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.max) {
      // Delete the first (oldest) entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const expiresAt = ttl > 0 ? Date.now() + ttl : Infinity;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Check if key exists and has not expired
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Delete an entry
   * @param {string} key
   * @returns {boolean}
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get current size
   */
  get size() {
    return this.cache.size;
  }
}
