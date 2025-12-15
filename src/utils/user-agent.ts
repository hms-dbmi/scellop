/**
 * A utility class for testing user agent strings to identify browsers and their versions.
 */
export class UserAgentTester {
  // Private field to store the user agent string
  #ua: string;

  /**
   * Constructor for UserAgentTester
   * Takes in a user agent string to analyze
   * @param ua
   */
  constructor(ua: string) {
    this.#ua = ua;
  }

  /**
   *
   * @returns whether the user is using a mobile browser
   */
  isMobile() {
    return /Mobi|Android/i.test(this.#ua);
  }

  /**
   *
   * @returns whether the user is using an Android phone
   */
  isAndroid() {
    return /Android/i.test(this.#ua);
  }

  /**
   * @returns the version of Android the user is using, or -1 if it is not found.
   */
  getAndroidVersion() {
    if (this.isAndroid()) {
      const versionMatch = this.#ua.match(/Android\s+([\d.]+)/i);
      return versionMatch ? parseInt(versionMatch[1], 10) : -1;
    }
    return -1;
  }

  /**
   *
   * @returns whether the user agent corresponds to Google Chrome
   */
  isChrome() {
    return /Chrome/.test(this.#ua) && /Google Inc/.test(navigator.vendor);
  }

  /**
   *
   * @returns the version of the Chrome browser the user is using, or -1 if it is not found.
   */
  getChromeVersion() {
    if (this.isChrome()) {
      const versionMatch = this.#ua.match(/Chrome\/(\d+)/);
      return versionMatch ? parseInt(versionMatch[1], 10) : -1;
    }
    return -1;
  }

  /**
   *
   * @returns whether the user agent corresponds to Firefox
   */
  isFirefox() {
    return /Firefox/.test(this.#ua);
  }

  /**
   * @returns the version of the Firefox browser the user is using, or -1 if it is not found.
   */
  getFirefoxVersion() {
    if (this.isFirefox()) {
      const versionMatch = this.#ua.match(/Firefox\/(\d+)/);
      return versionMatch ? parseInt(versionMatch[1], 10) : -1;
    }
    return -1;
  }

  /**
   *
   * @returns whether the user agent corresponds to Safari
   */
  isSafari() {
    return /Safari/.test(this.#ua) && /Apple Computer/.test(navigator.vendor);
  }

  /**
   *
   * @returns The current version of the Safari browser the user is using, or -1 if it is not found.
   */
  getSafariVersion() {
    if (this.isSafari()) {
      const versionMatch = this.#ua.match(/Version\/(\d+)/);
      return versionMatch ? parseInt(versionMatch[1], 10) : -1;
    }
    return -1;
  }

  /**
   *
   * @returns whether the user agent corersponds to Edge
   */
  isEdge() {
    return /Edg/.test(this.#ua);
  }

  /**
   *
   * @returns The version of the edge browser the user is using, or -1 if it is not found.
   */
  getEdgeVersion() {
    if (this.isEdge()) {
      const versionMatch = this.#ua.match(/Edg\/(\d+)/);
      return versionMatch ? parseInt(versionMatch[1], 10) : -1;
    }
    return -1;
  }
}
