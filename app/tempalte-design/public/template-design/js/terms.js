try{if(localStorage.get("__framer_force_showing_editorbar_since")){const n=document.createElement("link");n.rel = "modulepreload";n.href="https://framer.com/edit/init.mjs";document.head.appendChild(n)}}catch(e){}

        (function() {
          window.__FcCheckoutConfigs = window.__FcCheckoutConfigs || {};
          window.__FcCheckoutConfigs = {
            ...window.__FcCheckoutConfigs,
            checkoutLocale: "en",
            defaultCountry: "Germany",
            defaultCountryCode: "DE",
            defaultCurrency: "EUR",
            defaultCurrencySymbol: "€",
            metaPixelId: "",
            googleAnalyticsId: ""
          };

          // Store settings in localStorage for persistence!!
          const existingLocale = localStorage.getItem('checkoutLocale');
          if (existingLocale === null) {
            localStorage.setItem('checkoutLocale', 'en');
          }
          const existingCountry = localStorage.getItem('selectedCountry');
          if (existingCountry === null) { 
            localStorage.setItem('selectedCountry', 'Germany');
          }
          const existingCountryCode = localStorage.getItem('selectedCountryCode');
          if (existingCountryCode === null) {
            localStorage.setItem('selectedCountryCode', 'DE');
          }
          const existingCurrency = localStorage.getItem('selectedCurrency');
          if (existingCurrency === null) {
            localStorage.setItem('selectedCurrency', 'EUR');
          }
          const existingCurrencySymbol = localStorage.getItem('selectedCurrencySymbol');
          if (existingCurrencySymbol === null) {
            localStorage.setItem('selectedCurrencySymbol', '€');
          }

          // Dispatch checkout settings update event
          const checkoutEvent = new CustomEvent('checkout__settings-updated', {
            detail: {
              previous: { ...window.__FcCheckoutConfigs },
              current: window.__FcCheckoutConfigs
            }
          });
          document.dispatchEvent(checkoutEvent);

          
          
        })();

    (function() {
      // Initialize shopXtools with version first
      window.shopXtools = window.shopXtools || {};

      window.shopXtools.version = "2.5";

      // ============================================================
      // FC Privacy & Consent Management
      // ============================================================
  
      window.FCConsentManager = {
        isBannerPresent: function() {
          // Check for Framer Cookie Banner presence by looking for framerCookiesConsentMode
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              const framerConsent = localStorage.getItem('framerCookiesConsentMode');
              return !!framerConsent;
            } catch (e) {
              // localStorage access error - assume no banner
              return false;
            }
          }

          return false;
        },

        getConsent: function() {
          const bannerDetected = this.isBannerPresent();

          if (!bannerDetected) {
            // No banner = pass the GDPR compliance decision to the project owner
            return {
              necessary: true,
              analytics: true,
              marketing: true,
              preferences: true,
              bannerDetected: false,
            };
          }

          // Check if user has interacted with Framer Cookie Banner
          // framerCookiesDismissed is set when user clicks accept OR reject
          try {
            const dismissed = localStorage.getItem('framerCookiesDismissed');

            if (!dismissed || dismissed === 'false') {
              // User hasn't interacted with banner yet - deny all tracking
              return {
                necessary: true,
                analytics: false,
                marketing: false,
                preferences: false,
                bannerDetected: true,
              };
            }

            // User has interacted - read their consent choices
            const framerConsent = localStorage.getItem('framerCookiesConsentMode');
            if (framerConsent) {
              const consent = JSON.parse(framerConsent);
              return {
                necessary: consent.necessary === true,
                analytics: consent.analytics === true,
                marketing: consent.marketing === true,
                preferences: consent.preferences === true,
                bannerDetected: true,
              };
            }
          } catch (e) {
            console.warn('[FC Privacy] Error reading framerCookiesConsentMode:', e);
          }

          // If banner detected but localStorage empty = user hasn't interacted yet
          // Default to DENIED (don't use google_tag_data as it may be polluted by GA4)
          if (bannerDetected && !localStorage.getItem('framerCookiesConsentMode')) {
            return {
              necessary: true,
              analytics: false,
              marketing: false,
              preferences: false,
              bannerDetected: true,
            };
          }

          // Fallback to google_tag_data.ics.entries (only if we have localStorage)
          const entries = window.google_tag_data?.ics?.entries || {};

          // Helper to extract consent value from the nested structure
          const getConsentValue = function(entry) {
            if (!entry) return 'denied';
            if (typeof entry === 'string') return entry;
            if (entry.update !== undefined) return entry.update;
            if (entry.initial !== undefined) return entry.initial;
            if (entry.default !== undefined) return entry.default;
            return 'denied';
          };

          return {
            necessary: getConsentValue(entries.security_storage) === 'granted',
            analytics: getConsentValue(entries.analytics_storage) === 'granted',
            marketing: getConsentValue(entries.ad_storage) === 'granted',
            preferences: getConsentValue(entries.functionality_storage) === 'granted',
            bannerDetected: true,
          };
        },

        canTrackAnalytics: function() {
          return this.getConsent().analytics;
        },

        canTrackMarketing: function() {
          return this.getConsent().marketing;
        },

        canStorePreferences: function() {
          return this.getConsent().preferences;
        },

        hasNecessaryConsent: function() {
          return this.getConsent().necessary;
        },

        logConsentState: function() {
          const consent = this.getConsent();

          console.group('[FC Privacy] Consent State');

          // Current consent state
          console.log('Current Consent:', consent);

          // Show tracking status
          console.log('Tracking Status:', {
            GA4_initialized: !!window.__fcGAInitialized,
            MetaPixel_initialized: !!window.__fcMetaPixelInitialized,
            Shopify_sync_initialized: !!window.__FCShopifySyncInitialized
          });

          // Listener info
          console.log('Active Listeners:', this._listeners.length);

          console.groupEnd();
        },

        logShopifySync: function() {
          console.group('[FC Privacy] Shopify Sync Debug');
          console.log('1. Sync initialized:', !!window.__FCShopifySyncInitialized);
          console.log('2. Can share cookies:', window.FCDomainValidator.canShareCookies());
          console.log('3. Checkout URL:', window.shopXtools?.cart?.checkoutUrl || 'N/A');
          console.log('4. Current domain:', window.location.hostname);

          const checkoutUrl = window.shopXtools?.cart?.checkoutUrl;
          if (checkoutUrl) {
            try {
              console.log('5. Checkout domain:', new URL(checkoutUrl.html).hostname);
            } catch(e) {
              console.log('5. Checkout domain: Invalid URL');
            }
          } else {
            console.log('5. Checkout domain: N/A');
          }

          console.log('6. Root domain:', window.FCDomainValidator.extractRootDomain(window.location.hostname));
          console.log('7. window.Shopify exists:', typeof window.Shopify !== 'undefined');
          console.log('8. Script element exists:', !!document.querySelector('script[src*="consent-tracking-api"]'));

          // Domain compatibility check
          if (checkoutUrl && !window.FCDomainValidator.canShareCookies()) {
            console.warn('Domain mismatch: Shopify Privacy API cannot sync consent between different root domains');
            console.warn('Framer domain:', window.location.hostname);
            console.warn('Checkout domain:', new URL(checkoutUrl.html).hostname);
            console.warn('Solution: Use a custom domain on the same root domain as your Shopify checkout');
          }

          console.groupEnd();
        },


        // Event listener support
        _listeners: [],
        _initialized: false,
        _eventHandlers: {},
        _originalDataLayerPush: null,
        _pollInterval: null,

        onConsentChange: function(callback) {
          if (typeof callback !== 'function') return function() {};

          // Add callback to listeners
          this._listeners.push(callback);

          // Initialize listeners on first call
          if (!this._initialized) {
            this._initializeListeners();
            this._initialized = true;
          }

          // Return unsubscribe function
          const self = this;
          return function() {
            self._listeners = self._listeners.filter(function(cb) { return cb !== callback; });

            // Clean up global listeners if no more callbacks
            if (self._listeners.length === 0) {
              self._cleanupListeners();
            }
          };
        },

        _initializeListeners: function() {
          const self = this;

          // Store handler references for cleanup
          this._eventHandlers.cookieConsentUpdate = function() {
            self._notifyListeners();
          };

          this._eventHandlers.storageChange = function(e) {
            if (e.key === 'framerCookiesConsentMode') {
              self._notifyListeners();
            }
          };

          // Listen for events
          window.addEventListener('cookie_consent_update', this._eventHandlers.cookieConsentUpdate);
          window.addEventListener('storage', this._eventHandlers.storageChange);

          // Poll localStorage for changes (storage event doesn't fire in same tab)
          let lastConsentValue = localStorage.getItem('framerCookiesConsentMode');
          let lastDismissedValue = localStorage.getItem('framerCookiesDismissed');
          this._pollInterval = setInterval(function() {
            const currentConsent = localStorage.getItem('framerCookiesConsentMode');
            const currentDismissed = localStorage.getItem('framerCookiesDismissed');

            // Notify if either value changes
            if (currentConsent !== lastConsentValue || currentDismissed !== lastDismissedValue) {
              lastConsentValue = currentConsent;
              lastDismissedValue = currentDismissed;
              self._notifyListeners();
            }
          }, 200);

          // Monitor dataLayer for consent updates
          if (window.dataLayer && !this._originalDataLayerPush) {
            this._originalDataLayerPush = window.dataLayer.push;
            window.dataLayer.push = function() {
              const result = self._originalDataLayerPush.apply(window.dataLayer, arguments);

              for (let i = 0; i < arguments.length; i++) {
                const data = arguments[i];

                if (Array.isArray(data) && data.length >= 2 && data[0] === 'consent') {
                  setTimeout(function() { self._notifyListeners(); }, 100);
                  break;
                }

                if (data && typeof data === 'object' && !Array.isArray(data)) {
                  if ('analytics_storage' in data || 'ad_storage' in data) {
                    setTimeout(function() { self._notifyListeners(); }, 100);
                    break;
                  }
                }
              }

              return result;
            };
          }
        },

        _cleanupListeners: function() {
          // Remove event listeners
          if (this._eventHandlers.cookieConsentUpdate) {
            window.removeEventListener('cookie_consent_update', this._eventHandlers.cookieConsentUpdate);
          }

          if (this._eventHandlers.storageChange) {
            window.removeEventListener('storage', this._eventHandlers.storageChange);
          }

          // Clear polling interval
          if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
          }

          // Restore original dataLayer.push
          if (window.dataLayer && this._originalDataLayerPush) {
            window.dataLayer.push = this._originalDataLayerPush;
            this._originalDataLayerPush = null;
          }

          // Reset state
          this._eventHandlers = {};
          this._initialized = false;
        },

        _notifyListeners: function() {
          const consent = this.getConsent();

          this._listeners.forEach(function(callback) {
            try {
              callback(consent);
            } catch (error) {
              console.error('[FC Privacy] Error in consent change listener:', error);
            }
          });
        },
      };

      // Auto-initialize consent monitoring
      (function() {
        window.FCConsentManager.onConsentChange(function() {
          // Silent listener to initialize the system
        });
      })();

      // DomainValidator: Checks if Framer and Shopify domains can share cookies
      window.FCDomainValidator = {
        extractRootDomain: function(hostname) {
          try {
            const parts = hostname.toLowerCase().split('.');
            if (parts.length <= 1) return hostname;

            const multiPartTLDs = ['co.uk', 'co.nz', 'co.za', 'com.html', 'com.br'];
            const lastTwo = parts.slice(-2).join('.');
            if (multiPartTLDs.indexOf(lastTwo) !== -1) {
              return parts.slice(-3).join('.');
            }

            return parts.slice(-2).join('.');
          } catch (e) {
            return hostname;
          }
        },

        areDomainsAligned: function(url1, url2) {
          try {
            const hostname1 = new URL(url1.html).hostname;
            const hostname2 = new URL(url2.html).hostname;
            const root1 = this.extractRootDomain(hostname1);
            const root2 = this.extractRootDomain(hostname2);
            return root1 === root2 && root1 !== '';
          } catch (e) {
            return false;
          }
        },

        canShareCookies: function() {
          const framerDomain = window.location.href;
          const checkoutUrl = window.shopXtools?.cart?.checkoutUrl;
          if (!checkoutUrl) return false;
          return this.areDomainsAligned(framerDomain, checkoutUrl);
        },

        logDomainInfo: function() {
          const framerDomain = window.location.hostname;
          const checkoutUrl = window.shopXtools?.cart?.checkoutUrl;
          const canSync = this.canShareCookies();

          console.log('[FC Privacy] Domain Status:', {
            framer: framerDomain,
            checkout: checkoutUrl ? new URL(checkoutUrl.html).hostname : 'N/A',
            canSync: canSync ? '✓ Aligned' : '✗ Not aligned',
          });
        },
      };

      // Initialize store configuration
      const fcConfigs = {
        storefrontDomain: "egfveh-bv.myshopify.com",
        storefrontAccessToken: "0a568f279b2d15d4d31c2cd0f058c372",
      };

      const CURRENCIES = {"AED":"د.إ","AFN":"Af","ALL":"L","AMD":"֏","ANG":"ƒ","AOA":"Kz","ARS":"$","AUD":"$","AWG":"ƒ","AZN":"₼","BAM":"KM","BBD":"$","BDT":"৳","BGN":"лв","BHD":"د.ب","BIF":"FBu","BMD":"$","BND":"$","BOB":"Bs.","BRL":"R$","BSD":"$","BTN":"Nu.","BWP":"P","BYN":"Br","BZD":"BZ$","CAD":"$","CDF":"FC","CHF":"Fr","CLP":"$","CNY":"¥","COP":"$","CRC":"₡","CVE":"$","CZK":"Kč","DJF":"Fdj","DKK":"kr","DOP":"RD$","DZD":"د.ج","EGP":"£","ERN":"Nfk","ETB":"Br","EUR":"€","FJD":"$","FKP":"£","GBP":"£","GEL":"₾","GHS":"₵","GIP":"£","GMD":"D","GNF":"FG","GTQ":"Q","GYD":"$","HKD":"$","HNL":"L","HRK":"kn","HTG":"G","HUF":"Ft","IDR":"Rp","ILS":"₪","INR":"₹","IQD":"ع.د","IRR":"﷼","ISK":"kr","JEP":"£","JMD":"J$","JOD":"د.ا","JPY":"¥","KES":"KSh","KGS":"сом","KHR":"៛","KID":"$","KMF":"CF","KRW":"₩","KWD":"د.ك","KYD":"$","KZT":"₸","LAK":"₭","LBP":"£","LKR":"රු","LRD":"$","LSL":"L","LTL":"Lt","LVL":"Ls","LYD":"ل.د","MAD":"د.م.","MDL":"MDL","MGA":"Ar","MKD":"ден","MMK":"Ks","MNT":"₮","MOP":"MOP$","MRU":"UM","MUR":"₨","MVR":"ރ","MWK":"MK","MXN":"$","MYR":"RM","MZN":"MT","NAD":"$","NGN":"₦","NIO":"C$","NOK":"kr","NPR":"रू","NZD":"$","OMR":"ر.ع.","PAB":"B/.","PEN":"S/.","PGK":"K","PHP":"₱","PKR":"₨","PLN":"zł","PYG":"₲","QAR":"ر.ق","RON":"lei","RSD":"Дин.","RUB":"₽","RWF":"FRw","SAR":"ر.س","SBD":"$","SCR":"₨","SDG":"ج.س.","SEK":"kr","SGD":"$","SHP":"£","SLL":"Le","SOS":"Sh","SRD":"$","SSP":"£","STN":"Db","SYP":"£","SZL":"E","THB":"฿","TJS":"ЅМ","TMT":"T","TND":"د.ت","TOP":"T$","TRY":"₺","TTD":"TT$","TWD":"NT$","TZS":"TSh","UAH":"₴","UGX":"USh","USD":"$","UYU":"$","UZS":"so'm","VED":"Bs.S.","VES":"Bs.","VND":"₫","VUV":"VT","WST":"T","XAF":"FCFA","XCD":"$","XOF":"CFA","XPF":"₣","XXX":"","YER":"﷼","ZAR":"R","ZMW":"ZK","BYR":"Br","STD":"Db","VEF":"Bs."}; 
      const knownCurrenciesWithCodeAsSymbol = ["CHF","PLN","SEK","NOK","DKK","CZK","HUF","RON","HRK","BGN","ISK","MDL","BYN","KZT","AMD","UZS","TJS","KGS","MNT","GEL","AFN","MRU","RWF","XAF","XOF","XPF"]; 
      // Initialize default currency variables
      let defaultCountry = '';
      let defaultCountryCode = '';
      let defaultCurrency = '';
      let defaultCurrencySymbol = '';

      document.addEventListener('checkout__settings-updated', (event) => {
        const { current } = event.detail;
        if (current) {
          // Update the global default variables
          defaultCountry = current.defaultCountry || '';
          defaultCountryCode = current.defaultCountryCode || '';
          defaultCurrency = current.defaultCurrency || '';
          defaultCurrencySymbol = current.defaultCurrencySymbol || '';

          // Set session storage only if it's empty (reverted to 2.0 stable behavior)
          if (!localStorage.getItem('selectedCountry')) {
            localStorage.setItem('selectedCountry', defaultCountry);
          }
          if (!localStorage.getItem('selectedCountryCode')) {
            localStorage.setItem('selectedCountryCode', defaultCountryCode);
          }
          if (!localStorage.getItem('selectedCurrency')) {
            localStorage.setItem('selectedCurrency', defaultCurrency);
          }
          if (!localStorage.getItem('selectedCurrencySymbol')) {
            localStorage.setItem('selectedCurrencySymbol', defaultCurrencySymbol);
          }

          // Clear product cache and refetch products with new currency
          localStorage.removeItem('fc_products');
          localStorage.removeItem('fc_products_timestamp');
          
          // Refetch products with the current country code
          const currentCountryCode = localStorage.getItem('selectedCountryCode');
          if (currentCountryCode) {
            fetchProductsByCountry(currentCountryCode).catch(error => {
              console.error('Error refetching products after currency change:', error);
              window.shopXtools.status = "ready";
            });
          }

          // console.log('Session storage is set:', {
          //   defaultCountry,
          //   defaultCountryCode,
          //   defaultCurrency,
          //   defaultCurrencySymbol
          // });
        }
      });
      
      let domain;
      let products = [];
    
      // ALL QUERIES
      // Query to fetch specific products by IDs (for priority fetching)
      const getProductsByIdsQuery = `
        query GetProductsByIds($ids: [ID!]!, $countryCode: CountryCode) @inContext(country: $countryCode) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
              vendor
              handle
              productType
              tags
              createdAt
              collections(first: 250) {
                edges {
                  node {
                    id
                    title
                    handle
                  }
                }
              }
              images(first: 20) {
                edges {
                  node {
                    url
                    altText
                    width
                    height
                   }
                  }
              }
              metafields(identifiers: [
                { namespace: "custom", key: "fc_color" },
                { namespace: "custom", key: "fc_size" }
              ]) {
                key
                namespace
                value
              }
              sellingPlanGroups(first: 1) {
                edges {
                  node {
                    name
                    options {
                      name
                      values
                    }
                    sellingPlans(first: 10) {
                      edges {
                        node {
                          id
                          name
                          description
                          recurringDeliveries
                          priceAdjustments {
                            orderCount
                            adjustmentValue {
                              __typename
                              ... on SellingPlanPercentagePriceAdjustment {
                                adjustmentPercentage
                              }
                              ... on SellingPlanFixedAmountPriceAdjustment {
                                adjustmentAmount {
                                  amount
                                  currencyCode
                                }
                              }
                              ... on SellingPlanFixedPriceAdjustment {
                                price {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              options {
                id
                name
                values
              }
              compareAtPriceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 250) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  endCursor
                }
                edges {
                  node {
                    id
                    image {
                      url
                      altText
                      width
                      height
                    }
                    title
                    sku
                    quantityAvailable
                    availableForSale
                    requiresShipping
                    selectedOptions {
                      name
                      value
                    }
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      `;
      
      const getCartQuery = `
        query GetCart($cartId: ID!) {
          cart(id: $cartId) {
            id
            createdAt
            updatedAt
            checkoutUrl
            buyerIdentity {
              countryCode
            }
            lines(first: 250) {
              edges {
                node {
                  id
                  quantity
                  sellingPlanAllocation { 
                    checkoutChargeAmount {
                      amount
                      currencyCode
                    }
                    sellingPlan {
                      id
                      name
                      description
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      image {
                        url
                        altText
                        width
                        height
                      }
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        title
                        handle
                      }
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                  attributes {
                    key
                    value
                  }
                  cost {
                    subtotalAmount {
                      amount
                      currencyCode
                    }
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
            attributes {
              key
              value
            }
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      `;
    
      const getCartQueryNoPlans = `
        query GetCart($cartId: ID!) {
          cart(id: $cartId) {
            id
            createdAt
            updatedAt
            checkoutUrl
            buyerIdentity {
              countryCode
            }
            lines(first: 250) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      image {
                        url
                        altText
                        width
                        height
                      }
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        title
                        handle
                      }
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                  attributes {
                    key
                    value
                  }
                  cost {
                    subtotalAmount {
                      amount
                      currencyCode
                    }
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
            attributes {
              key
              value
            }
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      `;


      // Get available currencies from the store
      const getAvailableCurrencies = `
        query GetAvailableCurrencies {
          localization {
            availableCountries {
              currency {
                isoCode
                name
                symbol
              }
              isoCode
              name
            }
          }
        }
      `;

      // Collection-specific queries - Keeping the improved queries from 2.1
      const getProductsQueryByCollection = `
        query GetProductsByCollection($cursor: String, $countryCode: CountryCode, $collectionHandle: String!) @inContext(country: $countryCode) {
          collection(handle: $collectionHandle) {
            products(first: 250, after: $cursor) {
              edges {
                node {
                  id
                  title
                  vendor
                  handle
                  productType
                  tags
                  collections(first: 250) {
                    edges {
                      node {
                        id
                        title
                        handle
                      }
                    }
                  }
                  images(first: 20) {
                    edges {
                      node {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                  metafields(identifiers: [
                    { namespace: "custom", key: "fc_color" },
                    { namespace: "custom", key: "fc_size" }
                  ]) {
                    key
                    namespace
                    value
                  }
                  sellingPlanGroups(first: 1) {
                    edges {
                      node {
                        name
                        options {
                          name
                          values
                        }
                        sellingPlans(first: 10) {
                          edges {
                            node {
                              id
                              name
                              description
                              recurringDeliveries
                              priceAdjustments {
                                orderCount
                                adjustmentValue {
                                  __typename
                                  ... on SellingPlanPercentagePriceAdjustment {
                                    adjustmentPercentage
                                  }
                                  ... on SellingPlanFixedAmountPriceAdjustment {
                                    adjustmentAmount {
                                      amount
                                      currencyCode
                                    }
                                  }
                                  ... on SellingPlanFixedPriceAdjustment {
                                    price {
                                      amount
                                      currencyCode
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  options {
                    id
                    name
                    values
                  }
                  compareAtPriceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                    maxVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                    maxVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  variants(first: 250) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                      endCursor
                    }
                    edges {
                      node {
                        id
                        image {
                          url
                          altText
                          width
                          height
                        }
                        title
                        sku
                        quantityAvailable
                        availableForSale
                        requiresShipping
                        selectedOptions {
                          name
                          value
                        }
                        price {
                          amount
                          currencyCode
                        }
                        compareAtPrice {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `;

      const getLessProductsQueryByCollection = `
        query GetProductsByCollection($cursor: String, $countryCode: CountryCode, $collectionHandle: String!) @inContext(country: $countryCode) {
          collection(handle: $collectionHandle) {
            products(first: 80, after: $cursor) {
              edges {
                node {
                  id
                  title
                  vendor
                  handle
                  productType
                  tags
                  collections(first: 250) {
                    edges {
                      node {
                        id
                        title
                        handle
                      }
                    }
                  }
                  images(first: 20) {
                    edges {
                      node {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                  metafields(identifiers: [
                    { namespace: "custom", key: "fc_color" },
                    { namespace: "custom", key: "fc_size" }
                  ]) {
                    key
                    namespace
                    value
                  }
                  sellingPlanGroups(first: 1) {
                    edges {
                      node {
                        name
                        options {
                          name
                          values
                        }
                        sellingPlans(first: 10) {
                          edges {
                            node {
                              id
                              name
                              description
                              recurringDeliveries
                              priceAdjustments {
                                orderCount
                                adjustmentValue {
                                  __typename
                                  ... on SellingPlanPercentagePriceAdjustment {
                                    adjustmentPercentage
                                  }
                                  ... on SellingPlanFixedAmountPriceAdjustment {
                                    adjustmentAmount {
                                      amount
                                      currencyCode
                                    }
                                  }
                                  ... on SellingPlanFixedPriceAdjustment {
                                    price {
                                      amount
                                      currencyCode
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  options {
                    id
                    name
                    values
                  }
                  compareAtPriceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                    maxVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                    maxVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  variants(first: 250) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                      endCursor
                    }
                    edges {
                      node {
                        id
                        image {
                          url
                          altText
                          width
                          height
                        }
                        title
                        sku
                        quantityAvailable
                        availableForSale
                        requiresShipping
                        selectedOptions {
                          name
                          value
                        }
                        price {
                          amount
                          currencyCode
                        }
                        compareAtPrice {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `;

      const getProductsQueryByCollectionBackup = `
        query GetProductsByCollectionBackup($cursor: String, $countryCode: CountryCode, $collectionHandle: String!) @inContext(country: $countryCode) {
          collection(handle: $collectionHandle) {
            products(first: 250, after: $cursor) {
              edges {
                node {
                  id
                  title
                  vendor
                  handle
                  productType
                  tags
                  collections(first: 250) {
                    edges {
                      node {
                        id
                        title
                        handle
                      }
                    }
                  }
                  images(first: 20) {
                    edges {
                      node {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                  metafields(identifiers: [
                    { namespace: "custom", key: "fc_color" },
                    { namespace: "custom", key: "fc_size" }
                  ]) {
                    key
                    namespace
                    value
                  }
                  options {
                    id
                    name
                    values
                  }
                  compareAtPriceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                    maxVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                    maxVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  variants(first: 250) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                      endCursor
                    }
                    edges {
                      node {
                        id
                        image {
                          url
                          altText
                          width
                          height
                        }
                        title
                        sku
                        quantityAvailable
                        availableForSale
                        requiresShipping
                        selectedOptions {
                          name
                          value
                        }
                        price {
                          amount
                          currencyCode
                        }
                        compareAtPrice {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `;

      // Get products by country - Keeping the improved queries from 2.1
      const getProductsQueryByCountry = `
        query GetProductsByCountry ($cursor: String, $countryCode: CountryCode, $query: String) @inContext(country: $countryCode) {
          products(
            first: 250, 
            after: $cursor, 
            query: $query
          ) {
            edges {
              node {
                id
                title
                vendor
                handle
                productType
                tags
                collections(first: 250) {
                  edges {
                    node {
                      id
                      title
                      handle
                    }
                  }
                }
                images(first: 20) {
                  edges {
                    node {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
                metafields(identifiers: [
                  { namespace: "custom", key: "fc_color" },
                  { namespace: "custom", key: "fc_size" }
                ]) {
                  key
                  namespace
                  value
                }
                sellingPlanGroups(first: 1) {
                  edges {
                    node {
                      name
                      options {
                        name
                        values
                      }
                      sellingPlans(first: 10) {
                        edges {
                          node {
                            id
                            name
                            description
                            recurringDeliveries
                            priceAdjustments {
                              orderCount
                              adjustmentValue {
                                __typename
                                ... on SellingPlanPercentagePriceAdjustment {
                                  adjustmentPercentage
                                }
                                ... on SellingPlanFixedAmountPriceAdjustment {
                                  adjustmentAmount {
                                    amount
                                    currencyCode
                                  }
                                }
                                ... on SellingPlanFixedPriceAdjustment {
                                  price {
                                    amount
                                    currencyCode
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                options {
                  id
                  name
                  values
                }
                compareAtPriceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 250) {
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                    endCursor
                  }
                  edges {
                    node {
                      id
                      image {
                        url
                        altText
                        width
                        height
                      }
                      title
                      sku
                      quantityAvailable
                      availableForSale
                      requiresShipping
                      selectedOptions {
                        name
                        value
                      }
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const getProductsQueryByCountryBackup = `
        query GetProductsByCountryBackup($cursor: String, $countryCode: CountryCode, $query: String) @inContext(country: $countryCode) {
          products(
            first: 250, 
            after: $cursor, 
            query: $query
          ) {
            edges {
              node {
                id
                title
                vendor
                handle
                productType
                tags
                collections(first: 250) {
                  edges {
                    node {
                      id
                      title
                      handle
                    }
                  }
                }
                images(first: 20) {
                  edges {
                    node {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
                metafields(identifiers: [
                  { namespace: "custom", key: "fc_color" },
                  { namespace: "custom", key: "fc_size" }
                ]) {
                  key
                  namespace
                  value
                }
                options {
                  id
                  name
                  values
                }
                compareAtPriceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 250) {
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                    endCursor
                  }
                  edges {
                    node {
                      id
                      image {
                        url
                        altText
                        width
                        height
                      }
                      title
                      sku
                      quantityAvailable
                      availableForSale
                      requiresShipping
                      selectedOptions {
                        name
                        value
                      }
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const getLessProductsQueryByCountry = `
        query GetProductsByCountry ($cursor: String, $countryCode: CountryCode, $query: String) @inContext(country: $countryCode) {
          products(
            first: 80, 
            after: $cursor, 
            query: $query
          ) {
            edges {
              node {
                id
                title
                vendor
                handle
                productType
                tags
                collections(first: 250) {
                  edges {
                    node {
                      id
                      title
                      handle
                    }
                  }
                }
                images(first: 20) {
                  edges {
                    node {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
                metafields(identifiers: [
                  { namespace: "custom", key: "fc_color" },
                  { namespace: "custom", key: "fc_size" }
                ]) {
                  key
                  namespace
                  value
                }
                sellingPlanGroups(first: 1) {
                  edges {
                    node {
                      name
                      options {
                        name
                        values
                      }
                      sellingPlans(first: 10) {
                        edges {
                          node {
                            id
                            name
                            description
                            recurringDeliveries
                            priceAdjustments {
                              orderCount
                              adjustmentValue {
                                __typename
                                ... on SellingPlanPercentagePriceAdjustment {
                                  adjustmentPercentage
                                }
                                ... on SellingPlanFixedAmountPriceAdjustment {
                                  adjustmentAmount {
                                    amount
                                    currencyCode
                                  }
                                }
                                ... on SellingPlanFixedPriceAdjustment {
                                  price {
                                    amount
                                    currencyCode
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                options {
                  id
                  name
                  values
                }
                compareAtPriceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 250) {
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                    endCursor
                  }
                  edges {
                    node {
                      id
                      image {
                        url
                        altText
                        width
                        height
                      }
                      title
                      sku
                      quantityAvailable
                      availableForSale
                      requiresShipping
                      selectedOptions {
                        name
                        value
                      }
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      window.shopXtools = window.shopXtools || {};
      window.shopXtools.products = [];
      window.shopXtools.fetchCart = null;
      window.shopXtools.dispatchEvent = (eventType, detail) => {
            const newEvent = new CustomEvent(eventType, { detail });
            document.dispatchEvent(newEvent);
          };
    
      window.shopXtools.handleCartMutation = async (mutation, variables) => {
        const endpoint = `https://${domain.host}/api/2024-07/graphql.json`;
        const token = fcConfigs.storefrontAccessToken;
    
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": token,
            },
            body: JSON.stringify({
              query: mutation,
              variables,
            }),
          });
          const result = await response.json();
          if (response.ok && !result.errors) {
            // If this is a cart mutation and we have cart data, save it to localStorage
            if (result.data && (result.data.cartCreate || result.data.cartLinesAdd || 
                result.data.cartLinesRemove || result.data.cartLinesUpdate || 
                result.data.cartBuyerIdentityUpdate)) {
              
              // Find the cart object in the response
              const cartData = result.data.cartCreate?.cart || 
                              result.data.cartLinesAdd?.cart || 
                              result.data.cartLinesRemove?.cart || 
                              result.data.cartLinesUpdate?.cart ||
                              result.data.cartBuyerIdentityUpdate?.cart;
              
              if (cartData) {
                //console.log("Saving cart data to localStorage:", cartData);
                // Update the global cart object
                window.shopXtools.cart = cartData;
                // Save to localStorage
                localStorage.setItem("shopXtools.cart", JSON.stringify(cartData));

                // Dispatch cart updated event for Shopify consent sync
                if (cartData.checkoutUrl) {
                  document.dispatchEvent(new CustomEvent('data__cart-updated', {
                    detail: { cart: cartData }
                  }));
                }

                // If this is a buyerIdentity update with a country code, update currency settings
                if (result.data.cartBuyerIdentityUpdate && cartData.buyerIdentity && cartData.buyerIdentity.countryCode) {
                  //console.log("Country code updated in cart:", cartData.buyerIdentity.countryCode);
                  // Trigger currency settings update
                  initializeCurrencySettings();
                }
              }
            }
            return result.data;
          } else {
            console.error("GraphQL errors:", result.errors);
            return null;
          }
        } catch (error) {
          console.error("Network error:", error);
          return null;
        }
      };


        window.shopXtools.handleTemporaryCartMutation = async (mutation, variables) => {
        const endpoint = `https://${domain.host}/api/2024-07/graphql.json`;
        const token = fcConfigs.storefrontAccessToken;

        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": token,
            },
            body: JSON.stringify({
              query: mutation,
              variables,
            }),
          });
          const result = await response.json();
          if (response.ok && !result.errors) {
            // If this is a cart mutation and we have cart data, save it to temporaryCart
            if (result.data && (result.data.cartCreate || result.data.cartLinesAdd || 
                result.data.cartLinesRemove || result.data.cartLinesUpdate || 
                result.data.cartBuyerIdentityUpdate)) {
              
              // Find the cart object in the response
              const cartData = result.data.cartCreate?.cart || 
                              result.data.cartLinesAdd?.cart || 
                              result.data.cartLinesRemove?.cart || 
                              result.data.cartLinesUpdate?.cart ||
                              result.data.cartBuyerIdentityUpdate?.cart;
              
              if (cartData) {
                // If this is a buyerIdentity update with a country code, update currency settings
                if (result.data.cartBuyerIdentityUpdate && cartData.buyerIdentity && cartData.buyerIdentity.countryCode) {
                  // Trigger currency settings update
                  initializeCurrencySettings();
                }
              }
            }
            return result.data; // Return the temporary cart data
          } else {
            console.error("GraphQL errors:", result.errors);
            return null;
          }
        } catch (error) {
          console.error("Network error:", error);
          return null;
        }
      };
    
      window.shopXtools.fetchCart = async function(cartId) {
        const variables = { cartId: cartId };
        const endpoint = `https://${domain.host}/api/2024-07/graphql.json`;
    
        const tryFetchCart = async (query, queryName) => {
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": fcConfigs.storefrontAccessToken,
              },
              body: JSON.stringify({ query: query, variables }),
            });
    
            const result = await response.json();
            if (result.errors) {
              console.error(`${queryName} failed with errors:`, result.errors);
              return null;
            }
    
            if (result.data && result.data.cart) {
              // Save cart data to localStorage
              //console.log("Saving fetched cart data to localStorage:", result.data.cart);
              window.shopXtools.cart = result.data.cart;
              localStorage.setItem("shopXtools.cart", JSON.stringify(result.data.cart));

              // Dispatch cart updated event for Shopify consent sync
              if (result.data.cart.checkoutUrl) {
                document.dispatchEvent(new CustomEvent('data__cart-updated', {
                  detail: { cart: result.data.cart }
                }));
              }
              
              // If cart has buyerIdentity with countryCode, update currency settings
              if (result.data.cart.buyerIdentity && result.data.cart.buyerIdentity.countryCode) {
                //console.log("Country code found in fetched cart:", result.data.cart.buyerIdentity.countryCode);
                // Trigger currency settings update
                initializeCurrencySettings();
              }
              
              return result.data.cart;
            } else {
              console.error(`Cart data not found in response from ${queryName}:`, result);
              return null;
            }
          } catch (error) {
            console.error(`Network error during ${queryName}:`, error);
            return null;
          }
        };
    
        let cartData = await tryFetchCart(getCartQuery, "Primary cart query");
        //console.log(cartData);
        if (!cartData) {
          //console.log("Primary cart query failed, attempting backup cart query...");
          cartData = await tryFetchCart(getCartQueryNoPlans, "Backup cart query");
        }
    
        return cartData;
      };
    
      const configValidation = () => {
        if (!fcConfigs.storefrontDomain) {
          throw Error("Storefront domain not found");
        }
        if (!fcConfigs.storefrontAccessToken) {
          throw Error("Storefront access token not found");
        }
      };
    
      const setDomainUrl = () => {
        let storeDomain = "https://test.shopify.com/";
        if (fcConfigs.storefrontDomain) {
          storeDomain = fcConfigs.storefrontDomain.startsWith("http")
            ? fcConfigs.storefrontDomain
            : `https://${fcConfigs.storefrontDomain}`;
        }
        domain = new URL(storeDomain.html);
      };
    
      const shopify = async (type, query, variables) => {
        const endpoint = `https://${domain.host}/api/2024-07/graphql.json`;
        const response = await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify({ [type]: query, variables }),
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": fcConfigs.storefrontAccessToken,
          },
        });
        const json = await response.json();
        return json.data;
      };
    
      window.shopXtools.priorityQueue = [];
      window.shopXtools.priorityFetching = false;
      window.shopXtools.pendingPriorityRequests = new Set();
      
      const getProducts = (_id) => {
        const fullId = _id.startsWith('gid://') ? _id : `gid://shopify/Product/${_id}`;
        console.log("checking fullId", fullId)
        if (window.shopXtools) {
        console.log("shopXtools initialized, trying to find the product")
          // First, try to find in existing products
          const product = window.shopXtools.products?.find(
            ({ node: product }) => product && product.id === fullId
          );

          if (product) {
            console.log("returning found product", product)
            return product;
          }
          // console.log("no product found, trying prioritized fetching")
          
          // Product not found - add to priority queue if not already there
          // The interval processor will pick this up and fetch it
          if (!window.shopXtools.pendingPriorityRequests.has(fullId)) {
            window.shopXtools.pendingPriorityRequests.add(fullId);
            window.shopXtools.priorityQueue.push(fullId);
          }
        }
        
      };
      window.shopXtools.getProducts = getProducts;

      // Function to fetch products by IDs (priority fetch)
      // Note: Priority queue properties will be initialized after setupInitialToolsObject is called
      const fetchProductsByIds = async (productIds, countryCode) => {
        if (!productIds || productIds.length === 0) return [];
        if (!domain || !domain.host) {
          // If domain not ready, wait a bit and try again
          setTimeout(() => fetchProductsByIds(productIds, countryCode), 100);
          return [];
        }

        // Remove any IDs that are already in products array
        const existingIds = new Set(
          (window.shopXtools.products || []).map(({ node }) => node?.id).filter(Boolean)
        );
        const missingIds = productIds.filter(id => {
          const fullId = id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`;
          return !existingIds.has(fullId);
        });

        if (missingIds.length === 0) return [];

        try {
          const endpoint = `https://${domain.host}/api/2024-07/graphql.json`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": fcConfigs.storefrontAccessToken,
            },
            body: JSON.stringify({
              query: getProductsByIdsQuery,
              variables: {
                ids: missingIds,
                countryCode: countryCode || localStorage.getItem("selectedCountryCode") || "US"
              }
            }),
          });

          const result = await response.json();
          
          if (result.errors) {
            console.error('Error fetching products by IDs:', result.errors);
            // Remove from pending requests so they can be retried
            missingIds.forEach(id => {
              window.shopXtools.pendingPriorityRequests.delete(
                id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`
              );
            });
            return [];
          }
          // console.log(result.data?.nodes)
          if (result.data?.nodes) {
            // Transform nodes to match the expected format used by handleProductData
            // This ensures priority products have the same structure as regular products
            const products = result.data.nodes
              .filter(node => node !== null && node.id)
              .map(node => {
                // Check required fields
                if (!node.id || !node.handle || !node.title) {
                  console.warn('Priority product missing required fields, skipping:', {
                    id: node.id,
                    handle: node.handle,
                    title: node.title
                  });
                  return null;
                }

                // Transform to match the structure from handleProductData (complete data path)
                return {
                  node: {
                    id: node.id,
                    handle: node.handle,
                    title: node.title,
                    vendor: node.vendor,
                    productType: node.productType,
                    tags: node.tags,
                    metafields: node.metafields,
                    collections: Array.isArray(node.collections)
                      ? node.collections // already transformed
                      : (node.collections?.edges || []).map(edge => ({
                        node: {
                          id: edge.node.id,
                          handle: edge.node.handle,
                          title: edge.node.title
                        }
                    })),
                    variants: {
                      edges: (node.variants?.edges || []).map(({ node: variant }) => ({
                        node: {
                          id: variant.id,
                          title: variant.title,
                          price: variant.price,
                          availableForSale: variant.availableForSale,
                          selectedOptions: variant.selectedOptions || [],
                          quantityAvailable: variant.quantityAvailable || 0,
                          compareAtPrice: variant.compareAtPrice,
                          requiresShipping: variant.requiresShipping
                        }
                      }))
                    },
                    options: node.options || [],
                    priceRange: node.priceRange,
                    compareAtPriceRange: node.compareAtPriceRange,
                    sellingPlanGroups: node.sellingPlanGroups ? {
                      edges: (node.sellingPlanGroups.edges || []).map(({ node: sellingPlanGroup }) => ({
                        node: {
                          name: sellingPlanGroup.name,
                          options: sellingPlanGroup.options,
                          sellingPlans: {
                            edges: (sellingPlanGroup.sellingPlans.edges || []).map(({ node: sellingPlan }) => ({
                              node: {
                                id: sellingPlan.id,
                                name: sellingPlan.name,
                                description: sellingPlan.description,
                                recurringDeliveries: sellingPlan.recurringDeliveries,
                                priceAdjustments: sellingPlan.priceAdjustments
                              }
                            }))
                          }
                        }
                      }))
                    } : null
                  }
                };
              })
              .filter(Boolean); // Remove null/invalid products

            if (products.length > 0) {
            console.log('Fetched priority products by IDs:', products)
              // Check if these products are actually NEW or if they were already in the array
              const existingProducts = window.shopXtools.products || [];
              const newProductIds = new Set(products.map(({ node }) => node.id));
              console.log('existingProducts products:', existingProducts)
              // Check if all fetched products already exist
              const allProductsAlreadyExist = products.every(({ node }) =>
                existingProducts.some(({ node: existing }) => existing.id === node.id)
              );
              console.log('allProductsAlreadyExist products:', allProductsAlreadyExist)
              // Remove from pending requests
              products.forEach(({ node }) => {
                window.shopXtools.pendingPriorityRequests.delete(node.id);
              });

              // If all products already exist, don't dispatch event to avoid unnecessary re-renders
              if (allProductsAlreadyExist) {
                console.log('Priority products already exist, skipping dispatch to prevent re-render');
                return products;
              }

              // Remove any existing products that match priority IDs to avoid duplicates
              const filteredExisting = existingProducts.filter(
                ({ node }) => node && !newProductIds.has(node.id)
              );
              console.log('filteredExisting products:', filteredExisting)
              // Insert priority products at the beginning
              window.shopXtools.products = [...products, ...filteredExisting];

              // Also update productsWithPrices to maintain consistency
              if (window.shopXtools.productsWithPrices) {
                const countryCodeKey = countryCode || localStorage.getItem("selectedCountryCode") || "US";
                const existingForCountry = window.shopXtools.productsWithPrices[countryCodeKey] || [];
                const filteredForCountry = existingForCountry.filter(
                  ({ node }) => node && !newProductIds.has(node.id)
                );
                window.shopXtools.productsWithPrices[countryCodeKey] = [
                  ...products,
                  ...filteredForCountry
                ];
              }

              // Use requestAnimationFrame to defer the event dispatch until after the current render cycle
              // This prevents Framer components from losing their content during rapid re-renders
              requestAnimationFrame(() => {
                // Dispatch the main data__products-ready event so ALL components receive the priority products
                // This ensures components like ProductPrice get updated immediately
                // Priority products are included at the front of the products array (first in line)
                window.shopXtools.dispatchEvent('data__products-ready', {
                  products: window.shopXtools.products,
                  isInitialLoad: false,
                  isPriorityFetch: true
                });

                console.log('Priority products merged and dispatched via data__products-ready:', {
                  priorityProducts: products,
                  products: window.shopXtools.products,
                  totalProducts: window.shopXtools.products.length,
                  requestedIds: missingIds
                })
                // console.log("products", products)
              });

              return products;
            }
          }
          
          // Remove from pending requests even if no products returned
          missingIds.forEach(id => {
            window.shopXtools.pendingPriorityRequests.delete(
              id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`
            );
          });
          
          return [];
        } catch (error) {
          console.error('Error fetching products by IDs:', error);
          // Remove from pending requests so they can be retried
          missingIds.forEach(id => {
            window.shopXtools.pendingPriorityRequests.delete(
              id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`
            );
          });
          return [];
        }
      };

      // Process priority queue
      const processPriorityQueue = async () => {
        if (window.shopXtools.priorityQueue.length === 0) return;
        if (!domain || !domain.host) {
          // Wait for domain to be ready
          setTimeout(() => processPriorityQueue(), 100);
          return;
        }

        window.shopXtools.priorityFetching = true;
        const countryCode = localStorage.getItem("selectedCountryCode") || "US";
        
        // Batch process up to 50 IDs at a time (Shopify limit for nodes query)
        const batchSize = 50;
        const queue = [...window.shopXtools.priorityQueue];
        window.shopXtools.priorityQueue = [];

        for (let i = 0; i < queue.length; i += batchSize) {
          const batch = queue.slice(i, i + batchSize);
          await fetchProductsByIds(batch, countryCode);
          // console.log("Processing queued products for", countryCode, batch)
          // Small delay to avoid rate limiting
          if (i + batchSize < queue.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        window.shopXtools.priorityFetching = false;
        
        // Process any new items added to queue during processing
        if (window.shopXtools.priorityQueue.length > 0) {
          setTimeout(processPriorityQueue, 0);
        }
      };

      // Function to fetch available currencies
      const fetchAvailableCurrencies = async () => {
        // console.log("Domain object in fetchAvailableCurrencies:", domain);
        // console.log("Domain host:", domain?.host);
        if (!domain || !domain.host) {
          console.warn("fetchAvailableCurrencies: domain not ready; skipping fetch");
          return null;
        }

        const endpoint = `https://${domain.host}/api/2024-07/graphql.json`;
        
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": fcConfigs.storefrontAccessToken,
            },
            body: JSON.stringify({ query: getAvailableCurrencies }),
          });

          const result = await response.json();
          //console.log("[CURRENCIES] Result:", result);
          if (result.errors) {
            console.error("Error fetching currencies:", result.errors);
            return null;
          }
          const availableCurrenciesAndCountries = result?.data?.localization?.availableCountries;
          
          //console.log("[CURRENCIES] Available Currencies:", availableCurrenciesAndCountries);
          sessionStorage.setItem("availableCurrenciesAndCountries", JSON.stringify(availableCurrenciesAndCountries));
          //console.log(sessionStorage.getItem("availableCurrenciesAndCountries")
          
          return { availableCurrenciesAndCountries };
          
        } catch (error) {
          console.error("Error fetching currencies:", error);
          return null;
        }
      };

      window.shopXtools.fetchAvailableCurrencies = fetchAvailableCurrencies;
    
      // Function to initialize currency settings
      const initializeCurrencySettings = async () => {
        // Ensure domain is initialized before proceeding
        if (!domain) {
            await setDomainUrl();
        }
        if (!domain || !domain.host) {
            console.error("Domain is still undefined after initialization. Cannot fetch currencies.");
            return;
        }

        // Retrieve available currencies from sessionStorage or fetch if not available
        let availableCurrenciesAndCountries = JSON.parse(sessionStorage.getItem("availableCurrenciesAndCountries"));
        if (!availableCurrenciesAndCountries) {
            const currencies = await fetchAvailableCurrencies();
            if (!currencies) {
                console.error("Failed to fetch available currencies");
                return;
            }
            availableCurrenciesAndCountries = currencies.availableCurrenciesAndCountries;
            sessionStorage.setItem("availableCurrenciesAndCountries", JSON.stringify(availableCurrenciesAndCountries));
        }

        // Get values from window.__FcCheckoutConfigs
        const fcCheckoutConfigs = window.__FcCheckoutConfigs || {};
        const configCountry = fcCheckoutConfigs.defaultCountry;
        const configCountryCode = fcCheckoutConfigs.defaultCountryCode;
        const configCurrency = fcCheckoutConfigs.defaultCurrency;
        const configCurrencySymbol = fcCheckoutConfigs.defaultCurrencySymbol;
        //console.log("configCurrencySymbol", configCurrencySymbol)
        
        // Get values from localStorage
        let storedCurrency = localStorage.getItem("selectedCurrency");
        let storedCountry = localStorage.getItem("selectedCountry");
        let storedCountryCode = localStorage.getItem("selectedCountryCode");
        let storedCurrencySymbol = localStorage.getItem("selectedCurrencySymbol");

        // Get cart data from localStorage
        let cart;
        try {
          const cartData = localStorage.getItem("shopXtools.cart");
          if (cartData) {
            cart = JSON.parse(cartData);
          } else {
            cart = {};
          }
        } catch (error) {
          console.error("Error parsing cart data:", error);
          cart = {};
        }
        
        const buyerIdentity = cart.buyerIdentity || {};
        const countryCodeFromCart = buyerIdentity.countryCode;
        window.shopXtools.cart = cart;

        // Determine the country code using the priority sequence
        let finalCountryCode;
        let finalCurrency = null;
        let finalCountry = null;
        let finalCurrencySymbol = null;
        
        if (countryCodeFromCart) {
          // Priority 1: Use country code from cart
          finalCountryCode = countryCodeFromCart;
        } else if (storedCountryCode && storedCurrency && storedCountry && storedCurrencySymbol) {
          // Priority 2: Use values from localStorage if all are present
          finalCountryCode = storedCountryCode;
          finalCurrency = storedCurrency;
          finalCountry = storedCountry;
          finalCurrencySymbol = storedCurrencySymbol;
        } else if (configCountryCode && configCurrency && configCountry) {
          // Priority 3: Use values from window.__FcCheckoutConfigs if all are present
          finalCountryCode = configCountryCode;
          finalCurrency = configCurrency;
          finalCountry = configCountry;
          finalCurrencySymbol = configCurrencySymbol;
        } else {
          // Priority 4: Use first available country if nothing else is available
          if (availableCurrenciesAndCountries && availableCurrenciesAndCountries.length > 0) {
            finalCountryCode = availableCurrenciesAndCountries[0].isoCode;
          } else {
            console.error("No country data available");
            return;
          }
        }
        
        // If we only have the country code (from cart or when other values are missing),
        // find the matching country data to get the currency and country name
        if (!finalCurrency || !finalCountry) {
          const matchedCountry = availableCurrenciesAndCountries.find(c => c.isoCode === finalCountryCode);
          if (matchedCountry) {
            finalCurrency = matchedCountry.currency.isoCode;
            finalCountry = matchedCountry.name;
            //finalCurrencySymbol = CURRENCIES[finalCurrency];
            if (knownCurrenciesWithCodeAsSymbol[finalCurrency]){
              finalCurrencySymbol = finalCurrency
            } else {
              finalCurrencySymbol = CURRENCIES[finalCurrency];
            }
          } else {
            // If no match found, use first available country as fallback
            if (availableCurrenciesAndCountries && availableCurrenciesAndCountries.length > 0) {
              const firstCountry = availableCurrenciesAndCountries[0];
              finalCountryCode = firstCountry.isoCode;
              finalCurrency = firstCountry.currency.isoCode;
              finalCountry = firstCountry.name;
              //finalCurrencySymbol = CURRENCIES[finalCurrency];
              if (knownCurrenciesWithCodeAsSymbol[finalCurrency]){
                finalCurrencySymbol = finalCurrency
              } else {
                finalCurrencySymbol = CURRENCIES[finalCurrency];
              }
            } else {
              console.error("Cannot determine country settings");
              return;
            }
          }
        }

        // Update localStorage with the final values
        localStorage.setItem("selectedCountry", finalCountry);
        localStorage.setItem("selectedCurrency", finalCurrency);
        localStorage.setItem("selectedCountryCode", finalCountryCode);
        localStorage.setItem("selectedCurrencySymbol", finalCurrencySymbol);

        // Also update window.shopXtools for global consistency
        window.shopXtools.defaultCurrency = finalCurrency;
        window.shopXtools.defaultCountry = finalCountry;
        window.shopXtools.defaultCountryCode = finalCountryCode;
        window.shopXtools.defaultCurrencySymbol = finalCurrencySymbol;

        // Dispatch an event to notify the application of currency settings changes
        const currencyEvent = new CustomEvent('currency__settings-updated', {
          detail: {
            previous: {
              defaultCountry: storedCountry,
              defaultCountryCode: storedCountryCode,
              defaultCurrency: storedCurrency,
              defaultCurrencySymbol: storedCurrencySymbol
            },
            current: {
              defaultCountry: finalCountry,
              defaultCountryCode: finalCountryCode,
              defaultCurrency: finalCurrency,
              defaultCurrencySymbol: finalCurrencySymbol
            }
          }
        });
        document.dispatchEvent(currencyEvent);
      };


      const handleProductData = (newProducts, countryCode, isInitialLoad = false, cursor = null) => {
        try {
          // Validate incoming data structure
          if (!Array.isArray(newProducts)) {
            console.warn('handleProductData: newProducts is not an array, converting to empty array');
            newProducts = [];
          }
          
          // Transform products into minimal format with only essential data
          const transformedProducts = newProducts.map(({ node }) => {
            // Validate node structure
            if (!node || typeof node !== 'object') {
              console.warn('handleProductData: Invalid node structure, skipping product');
              return null;
            }
            
            // Check required fields
            if (!node.id || !node.handle || !node.title) {
              console.warn('handleProductData: Product missing required fields, skipping:', { 
                id: node.id, 
                handle: node.handle, 
                title: node.title 
              });
              return null;
            }
            // For initial load, include minimal but sufficient variant data with safety checks
            if (isInitialLoad) {
              return {
                node: {
                  id: node.id,
                  handle: node.handle,
                  title: node.title,
                  priceRange: node.priceRange,
                  compareAtPriceRange: node.compareAtPriceRange || null,
                  productType: node.productType || null,
                  tags: Array.isArray(node.tags) ? node.tags : [],
                  collections: (() => {
                    try {
                      return node.collections?.edges ? 
                        node.collections.edges.map(edge => ({
                          node: {
                            id: edge.node?.id || '',
                            handle: edge.node?.handle || '',
                            title: edge.node?.title || ''
                          }
                        })).filter(col => col.node.id && col.node.handle) : [];
                    } catch (error) {
                      console.warn('Error processing collections, using empty array:', error);
                      return [];
                    }
                  })(),
                  metafields: node.metafields || [],
                  variants: { 
                    edges: (() => {
                      try {
                        return (node.variants?.edges || []).map(({ node: variant }) => ({
                          node: {
                            id: variant?.id || '',
                            title: variant?.title || '',
                            price: variant?.price || null,
                            availableForSale: Boolean(variant?.availableForSale),
                            selectedOptions: Array.isArray(variant?.selectedOptions) ? variant.selectedOptions : [],
                            quantityAvailable: Number(variant?.quantityAvailable) || 0,
                            compareAtPrice: variant?.compareAtPrice || null
                          }
                        })).filter(v => v.node.id); // Remove invalid variants
                      } catch (error) {
                        console.warn('Error processing variants, using empty array:', error);
                        return [];
                      }
                    })()
                  },
                  options: node.options || []
                }
              };
            }

            // For complete data load, include all necessary fields
            return {
              node: {
                id: node.id,
                handle: node.handle,
                title: node.title,
                vendor: node.vendor,
                productType: node.productType,
                tags: node.tags,
                metafields: node.metafields,
                collections: Array.isArray(node.collections)
                  ? node.collections // already transformed
                  : (node.collections?.edges || []).map(edge => ({
                    node: {
                      id: edge.node.id,
                      handle: edge.node.handle,
                      title: edge.node.title
                    }
                })),
                variants: { 
                  edges: (node.variants?.edges || []).map(({ node: variant }) => ({
                    node: {
                      id: variant.id,
                      title: variant.title,
                      price: variant.price,
                      availableForSale: variant.availableForSale,
                      selectedOptions: variant.selectedOptions || [],
                      quantityAvailable: variant.quantityAvailable || 0,
                      compareAtPrice: variant.compareAtPrice,
                      requiresShipping: variant.requiresShipping
                    }
                  }))
                },
                options: node.options || [],
                priceRange: node.priceRange,
                compareAtPriceRange: node.compareAtPriceRange,
                sellingPlanGroups: node.sellingPlanGroups ? {
                  edges: (node.sellingPlanGroups.edges || []).map(({ node: sellingPlanGroup }) => ({
                    node: {
                      name: sellingPlanGroup.name,
                      options: sellingPlanGroup.options,
                      sellingPlans: {
                        edges: (sellingPlanGroup.sellingPlans.edges || []).map(({ node: sellingPlan }) => ({
                          node: {
                            id: sellingPlan.id,
                            name: sellingPlan.name,
                            description: sellingPlan.description,
                            recurringDeliveries: sellingPlan.recurringDeliveries,
                            priceAdjustments: sellingPlan.priceAdjustments
                          }
                        }))
                      }
                    }
                  }))
                } : null
              }
            };
          }).filter(Boolean); // Remove null/invalid products

          // Log validation results
          if (transformedProducts.length !== newProducts.length) {
            console.warn('handleProductData: Filtered out ' + (newProducts.length - transformedProducts.length) + ' invalid products');
          }

          // --- ADDED LOGGING FOR COLLECTION FILTER ---
          // if (window.shopXtools && window.shopXtools.lastAppliedFilters && window.shopXtools.lastAppliedFilters.collection) {
          //   const collectionHandle = window.shopXtools.lastAppliedFilters.collection.toLowerCase();
          //   // Only keep items that do NOT have the collection
          //   const missing = transformedProducts.filter(({ node }) => {
          //     const collections = Array.isArray(node.collections) ? node.collections : [];
          //     return !collections.some(col => (col.node?.handle || '').toLowerCase() === collectionHandle);
          //   });
          //   const allMatch = missing.length === 0;
          //   console.log('[Collection Check] Total items processed:', transformedProducts.length);
          //   console.log('[Collection Check] All items have collection', collectionHandle, ':', allMatch);
          //   if (!allMatch) {
          //     console.log('[Collection Check] Items missing collection:', missing.map(({ node }) => node.id));
          //   }
          // }
          // --- END LOGGING ---

          // Always accumulate products, whether initial load or not
          if (!cursor) {
            // If this is the first page, start fresh
            products = transformedProducts;
          } else {
            // For subsequent pages, append to existing products
            products = [...products, ...transformedProducts];
          }

          // Store products in smaller chunks to avoid quota issues
          const CHUNK_SIZE = 50;
          const chunks = [];
          for (let i = 0; i < products.length; i += CHUNK_SIZE) {
            chunks.push(products.slice(i, i + CHUNK_SIZE));
          }

          let storageQuotaExceeded = false;

          // Update storage with all chunks
          try {
            // Only attempt to clear old chunks if we haven't hit quota yet
            if (!storageQuotaExceeded) {
              try {
                const oldMetadata = JSON.parse(sessionStorage.getItem('fc_products_' + countryCode + '_metadata') || '{}');
                if (oldMetadata.totalChunks) {
                  for (let i = 0; i < oldMetadata.totalChunks; i++) {
                    sessionStorage.removeItem('fc_products_' + countryCode + '_chunk_' + i);
                  }
                }
              } catch (error) {
                console.warn('Storage quota exceeded during cleanup, switching to in-memory only');
                storageQuotaExceeded = true;
              }
            }

            // Only attempt to store new chunks if we haven't hit quota yet
            if (!storageQuotaExceeded) {
              for (let i = 0; i < chunks.length; i++) {
                const chunkKey = 'fc_products_' + countryCode + '_chunk_' + i;
                try {
                  sessionStorage.setItem(chunkKey, JSON.stringify(chunks[i]));
                } catch (storageError) {
                  console.warn('Storage quota exceeded at chunk', i, ', switching to in-memory only');
                  storageQuotaExceeded = true;
                  break;
                }
              }

              // Only attempt to update metadata if we haven't hit quota
              if (!storageQuotaExceeded) {
                const metadata = {
                  totalChunks: chunks.length,
                  totalProducts: products.length,
                  lastUpdated: Date.now(),
                  isComplete: !cursor
                };
                try {
                  sessionStorage.setItem('fc_products_' + countryCode + '_metadata', JSON.stringify(metadata));
                } catch (error) {
                  console.warn('Storage quota exceeded during metadata update');
                  storageQuotaExceeded = true;
                }
              }
            }
          } catch (error) {
            console.warn('Storage operations failed, proceeding with in-memory only');
            storageQuotaExceeded = true;
          }

          // Update global references with complete product list (always do this regardless of storage status)
          window.shopXtools.productsWithPrices = { [countryCode]: products };
          window.shopXtools.products = products;

          // Set status and dispatch events
          window.shopXtools.status = "ready";
          window.shopXtools.dispatchEvent('data__products-ready', { 
            products: window.shopXtools.products,
            isInitialLoad
          });

          // Start fetching complete data immediately after displaying prices
          if (isInitialLoad && !cursor) {
            const { vendor, collection, productType, tag } = window.shopXtools.lastAppliedFilters || {};
            setTimeout(() => {
              fetchCompleteProductData(countryCode, vendor, collection, productType, tag);
            }, 0);
          }

          //console.log('[Products] Total products loaded:', products.length);
        } catch (error) {
          console.error('Error in handleProductData:', error);
          window.shopXtools.status = "error";
        }
      };

      // Client-side filtering function to ensure filters are applied correctly
      const filterProductsClientSide = (products, filters) => {
        const { vendor, collection, productType, tag } = filters;
        
        return products.filter(({ node }) => {
          // Filter by vendor if specified
          if (vendor && node.vendor !== vendor) {
            return false;
          }
          
          // Filter by collection if specified
          if (collection) {
            // Check if the product belongs to the specified collection
            const collections = node.collections || [];
            const matchingCollection = collections.find(col => 
              col.handle === collection.toLowerCase() || 
              col.title === collection
            );
            if (!matchingCollection) {
              return false;
            }
          }
          
          // Filter by product type if specified
          if (productType && node.productType !== productType) {
            return false;
          }
          
          // Filter by tag if specified
          if (tag) {
            const tags = node.tags || [];
            if (!tags.includes(tag)) {
              return false;
            }
          }
          
          return true;
        });
      };

      const fetchProductsByCountry = async (countryCode, cursor = null, vendor = null, collection = null, productType = null, tag = null) => {
        // Store filter information if this is a first page request
        if (!cursor) {
          const newFilters = { vendor, collection, productType, tag };
          window.shopXtools.lastAppliedFilters = newFilters;
          
          // Store filters in sessionStorage
          try {
            const storedFilters = JSON.parse(sessionStorage.getItem('fc_filters') || '{}');
            const filtersChanged = JSON.stringify(storedFilters) !== JSON.stringify(newFilters);
            
            if (filtersChanged) {
              sessionStorage.setItem('fc_filters', JSON.stringify(newFilters));
              // Force refresh from Shopify if filters changed
              products = [];
              return fetchProductsByCountry(countryCode, null, vendor, collection, productType, tag);
            }
          } catch (error) {
            console.error('Error handling filter storage:', error);
          }
          
          products = [];
          
          // Try to load and display cached data immediately
          try {
            const metadata = JSON.parse(sessionStorage.getItem('fc_products_' + countryCode + '_metadata') || '{}');
            // console.log('[Cache] metadata', metadata);
            // console.log('[Cache] cursor', cursor);
            if (metadata.totalChunks > 0) {
              let cachedProducts = [];
              for (let i = 0; i < metadata.totalChunks; i++) {
                const chunkKey = 'fc_products_' + countryCode + '_chunk_' + i;
                const chunk = JSON.parse(sessionStorage.getItem(chunkKey) || '[]');
                cachedProducts = cachedProducts.concat(chunk);
                // console.log('[Cache] cachedProducts', cachedProducts);
              }
              
              if (cachedProducts.length > 0) {
                //console.log('[Cache] Displaying', cachedProducts.length, 'cached products');
                handleProductData(cachedProducts, countryCode, false, cursor);
                
                // If cache is older than 1 minute or incomplete, refresh in background
                if (Date.now() - metadata.lastUpdated > 60000 || !metadata.isComplete) {
                  //console.log('[Cache] Starting background refresh');
                } else {
                  //console.log('[Cache] Cache is fresh and complete, skipping refresh');
                  return;
                }
              }
            }
          } catch (error) {
            console.error('Error loading from cache:', error);
          }
        }

        try {
          let response;
          let variables;
          let query;

          // Use collection-specific query structure if a collection filter is provided
          if (collection) {
            query = getProductsQueryByCollection;
            variables = {
              countryCode,
              collectionHandle: collection.toLowerCase(),
              ...(cursor && { cursor })
            };
            
            //console.log("[FILTER] Using collection-specific query for:", collection);
          } else {
            query = getProductsQueryByCountry;
            
            // Build query string for non-collection filters
            const queryParts = [];
            if (vendor) queryParts.push(`vendor:${vendor}`);
            if (productType) queryParts.push(`product_type:${productType}`);
            if (tag) queryParts.push(`tag:${tag}`);
            const queryString = queryParts.length > 0 ? queryParts.join(" AND ") : null;

            variables = {
              countryCode,
              ...(cursor && { cursor }),
              ...(queryString && { query: queryString })
            };
          }

          response = await fetch(`https://${domain.host}/api/2024-07/graphql.json`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": fcConfigs.storefrontAccessToken,
            },
            body: JSON.stringify({ query, variables }),
          });

          const result = await response.json();
          
          if (collection) {
            // Handle collection-specific response structure
            if (!result.errors && result.data?.collection?.products) {
              const newProducts = result.data.collection.products.edges || [];
              handleProductData(newProducts, countryCode, true, cursor);

              // Continue pagination if there are more products
              const pageInfo = result.data.collection.products.pageInfo;
              if (pageInfo.hasNextPage && pageInfo.endCursor) {
                await fetchProductsByCountry(countryCode, pageInfo.endCursor, vendor, collection, productType, tag);
              } else {
                // All products have been fetched, update the metadata
                const metadata = {
                  totalChunks: Math.ceil(products.length / 50),
                  totalProducts: products.length,
                  lastUpdated: Date.now(),
                  isComplete: true
                };
                sessionStorage.setItem('fc_products_' + countryCode + '_metadata', JSON.stringify(metadata));
              }
            } else if (result.errors) {
              console.error('Error fetching collection products:', result.errors);
              window.shopXtools.status = "error";
            } else if (!result.data?.collection) {
              console.error('Collection not found:', collection);
              window.shopXtools.status = "ready";
              window.shopXtools.products = [];
              window.shopXtools.dispatchEvent('data__products-ready', { 
                products: [],
                isInitialLoad: false
              });
            }
          } else {
            // Handle regular product query response
            if (!result.errors && result.data?.products) {
              const newProducts = result.data.products.edges || [];
              handleProductData(newProducts, countryCode, true, cursor);

              // Continue pagination if there are more products
              const pageInfo = result.data.products.pageInfo;
              if (pageInfo.hasNextPage && pageInfo.endCursor) {
                await fetchProductsByCountry(countryCode, pageInfo.endCursor, vendor, collection, productType, tag);
              } else {
                // All products have been fetched, update the metadata
                const metadata = {
                  totalChunks: Math.ceil(products.length / 50),
                  totalProducts: products.length,
                  lastUpdated: Date.now(),
                  isComplete: true
                };
                sessionStorage.setItem('fc_products_' + countryCode + '_metadata', JSON.stringify(metadata));
              }
            }
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          window.shopXtools.status = "error";
        }
      };

      // Function to fetch complete product data in the background
      const fetchCompleteProductData = async (countryCode, vendor, collection, productType, tag) => {
        let cursor = null;
        let allProducts = [];

        try {
            while (true) {
                let response;
                let variables;
                let query;

                // Use collection-specific query for collections, matching the main fetch function
                if (collection) {
                    query = getLessProductsQueryByCollection;
                    variables = {
                        countryCode,
                        collectionHandle: collection.toLowerCase(),
                        ...(cursor && { cursor })
                    };
                } else {
                    // For non-collection filters, use regular query
                    query = getLessProductsQueryByCountry;
                    
                    // Build query parts
                    const queryParts = [];
                    if (vendor) queryParts.push(`vendor:${vendor}`);
                    if (productType) queryParts.push(`product_type:${productType}`);
                    if (tag) queryParts.push(`tag:${tag}`);
                    const queryString = queryParts.length > 0 ? queryParts.join(" AND ") : null;
                    
                    variables = {
                        countryCode,
                        cursor,
                        ...(queryString && { query: queryString })
                    };
                }

                response = await fetch(`https://${domain.host}/api/2024-07/graphql.json`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Shopify-Storefront-Access-Token": fcConfigs.storefrontAccessToken,
                    },
                    body: JSON.stringify({ query, variables }),
                });

                const result = await response.json();
                // console.log('result', result);
                if (collection) {
                    // Handle collection response structure
                    if (!result.errors && result.data?.collection?.products) {
                        const newProducts = result.data.collection.products.edges || [];
                        allProducts = [...allProducts, ...newProducts];

                        // Update data every 500 products or when complete
                        if (allProducts.length >= 500 || !result.data.collection.products.pageInfo.hasNextPage) {
                            handleProductData(allProducts, countryCode, false, cursor);
                            allProducts = [];
                        }

                        if (!result.data.collection.products.pageInfo.hasNextPage) {
                            break;
                        }
                        cursor = result.data.collection.products.pageInfo.endCursor;
                    } else {
                        console.error('Error fetching complete collection data:', result.errors);
                        break;
                    }
                } else {
                    // Handle regular product response
                    if (!result.errors && result.data?.products) {
                        const newProducts = result.data.products.edges || [];
                        allProducts = [...allProducts, ...newProducts];

                        // Update data every 500 products or when complete
                        if (allProducts.length >= 500 || !result.data.products.pageInfo.hasNextPage) {
                            handleProductData(allProducts, countryCode, false, cursor);
                            allProducts = [];
                        }

                        if (!result.data.products.pageInfo.hasNextPage) {
                            break;
                        }
                        cursor = result.data.products.pageInfo.endCursor;
                    } else {
                        console.error('Error fetching complete product data:', result.errors);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error in background data fetch:', error);
        }
      };

      // Initialize shopXtools and attach fetchProductsByCountry to it
      window.shopXtools = window.shopXtools || {};
      window.shopXtools.fetchProductsByCountry = fetchProductsByCountry;
      
      // Attach priority queue functions to shopXtools (properties already initialized in setupInitialToolsObject)
      window.shopXtools.fetchProductsByIds = fetchProductsByIds;
      window.shopXtools.processPriorityQueue = processPriorityQueue;

      // Start priority queue processor (runs continuously to process requested products)
      // This ensures priority products are fetched even before full product load completes
      if (typeof setInterval !== 'undefined') {
        setInterval(() => {
          if (window.shopXtools.priorityQueue && 
              window.shopXtools.priorityQueue.length > 0 && 
              !window.shopXtools.priorityFetching &&
              domain && domain.host) {
            processPriorityQueue();
          }
        }, 500); // Check every 500ms
      }
      
      configValidation();
      setDomainUrl();
      
  const validateDomainForFreePlan = () => {
    if ("free" === "free") {
      const isFramerSubdomain = domain.host.includes('framer.app');
      if (isFramerSubdomain) {
        console.error('Free plan users can only use a Framer subdomain');
        return false;
      }
    }
    return true;
  };

  if (!validateDomainForFreePlan()) {
    //console.log('Domain validation failed, products will not be fetched');
    return;
  }

      
  if ("free" === "free") {
    // Wait for DOM to be ready
    const insertWidget = () => {
      const widget = document.createElement('div');
      widget.innerHTML = `
        <div 
          style="
            position: fixed;
            bottom: 60px;
            right: 20px;
            border-radius: 10px;
            overflow: hidden;
            z-index: 999999;
            transition: opacity 0.3s ease;
            box-shadow:
              rgba(0, 0, 0, 0.26) 0px 0.636953px 1.14652px -1.125px, 
              rgba(0, 0, 0, 0.24) 0px 1.9316px 3.47689px -2.25px, 
              rgba(0, 0, 0, 0.192) 0px 5.10612px 9.19102px -3.375px, 
              rgba(0, 0, 0, 0.03) 0px 16px 28.8px -4.5px;
            width: 142px;
            background: white;
          "
          onmouseover="this.style.opacity = '1'"
          onmouseout="this.style.opacity = '1'"
        >
          <a 
            href="https://framercommerce.com/?utm_source=framer&amp;utm_medium=badge&amp;utm_campaign=free_tier" 
            target="_blank" 
            style="
              display: block;
              line-height: 0;
            "
          >
            <img 
              src="https://uc2e962a9c5e7e90a107a5985d82.dl.dropboxusercontent.com/cd/0/inline/DA-8rr4Yega5jOIfkvEKzuOc2YxgVgYQaM3r-jdATRe3CxjmwURLm3PFyp8M1HGCb-DLA5vMimDAJtoU6bg3FVuY05iSaZOt_ULkWiSsmrDyjBnfdqOa_-Br05T2y7CYoifWjdCgSnaCZH42-xi0Kql-/file#" 
              alt="Framer Commerce"
              width="142"
              height="36"
              style="display: block; width: 100%; height: auto;"
            />
          </a>
        </div>
      `;

      // Check if widget already exists
      const existingWidget = document.querySelector('[data-framercommerce-widget]');
      if (!existingWidget) {
        widget.setAttribute('data-framercommerce-widget', 'true');
        document.body.appendChild(widget);
      }
    };

    // If DOM is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(insertWidget, 1);
    } else {
      // Wait for DOM to be ready
      document.addEventListener('DOMContentLoaded', insertWidget);
    }

    // Backup in case DOMContentLoaded doesn't fire
    window.addEventListener('load', insertWidget);
  }


      // Initialize cart from localStorage
      const initializeCartFromLocalStorage = () => {
        try {
          const cartData = localStorage.getItem("shopXtools.cart");
          if (cartData) {
            const cart = JSON.parse(cartData);
            window.shopXtools.cart = cart;
            
            // If cart has buyerIdentity with countryCode, we'll use it during currency initialization
            if (cart.buyerIdentity && cart.buyerIdentity.countryCode) {
              // Found country code in stored cart
            }
          } else {
            window.shopXtools.cart = {};
          }
        } catch (error) {
          console.error("Error initializing cart from localStorage:", error);
          window.shopXtools.cart = {};
        }
      };

      // Initialize cart before proceeding with other initializations
      initializeCartFromLocalStorage();

      // Check domain before proceeding with product fetch
      if (!validateDomainForFreePlan()) {
        window.shopXtools.products = [];
        window.shopXtools.status = "ready";
        window.shopXtools.getProducts = () => null;
        return;
      }

      if (!window.shopXtools || !Array.isArray(window.shopXtools.products) || window.shopXtools.products.length === 0) {
        // Initialize currency settings first
        initializeCurrencySettings().then(() => {
            // Get the stored country code
            const storedCountryCode = localStorage.getItem("selectedCountryCode");
            if (storedCountryCode) {
              // Check for stored filters from other tabs/sessions
              let storedFilters;
              try {
                storedFilters = JSON.parse(sessionStorage.getItem('fc_filters') || '{}');
              } catch (error) {
                console.error('Error reading stored filters:', error);
                storedFilters = {};
              }
              
              // Initialize filtering capabilities with stored filters if they exist
              window.shopXtools.lastAppliedFilters = {
                vendor: storedFilters.vendor || null,
                collection: storedFilters.collection || null,
                productType: storedFilters.productType || null,
                tag: storedFilters.tag || null
              };
              
              // Initialize filtering capabilities
              window.shopXtools.getFilteredProducts = (filters = null) => {
                if (window.shopXtools.status !== "ready") {
                  console.warn("Products not yet loaded, please wait for data__products-ready event");
                  return [];
                }
                
                // If filters provided, fetch fresh filtered products
                if (filters) {
                  const countryCode = localStorage.getItem("selectedCountryCode");
                  if (!countryCode) {
                    console.error("No country code available for product fetch");
                    return [];
                  }
                  
                  // Store filters for future reference
                  window.shopXtools.lastAppliedFilters = { 
                    ...window.shopXtools.lastAppliedFilters,
                    ...filters
                  };
                  
                  // Fetch filtered products
                  window.shopXtools.fetchProductsByCountry(
                    countryCode,
                    null,
                    filters.vendor || null,
                    filters.collection || null,
                    filters.productType || null,
                    filters.tag || null
                  );
                  
                  // Return null to indicate async operation in progress
                  return null;
                }
                
                // If no new filters, but we have existing filters, apply client-side filtering
                const existingFilters = window.shopXtools.lastAppliedFilters;
                if (existingFilters.vendor || existingFilters.collection || existingFilters.productType || existingFilters.tag) {
                  // Get all products
                  const allProducts = window.shopXtools.productsWithPrices?.[localStorage.getItem("selectedCountryCode")] || [];
                  
                  // Apply client-side filtering
                  return filterProductsClientSide(allProducts, existingFilters);
                }
                
                // Otherwise return currently loaded products
                return window.shopXtools.products;
              };
              
              window.shopXtools.areProductsFiltered = () => {
                const filters = window.shopXtools.lastAppliedFilters || {};
                return !!(filters.vendor || filters.collection || filters.productType || filters.tag);
              };
              
              window.shopXtools.getFilterInfo = () => {
                const filters = window.shopXtools.lastAppliedFilters || {};
                const activeFilters = {};
                
                if (filters.vendor) activeFilters.vendor = filters.vendor;
                if (filters.collection) activeFilters.collection = filters.collection;
                if (filters.productType) activeFilters.productType = filters.productType;
                if (filters.tag) activeFilters.tag = filters.tag;
                
                const allProductsCount = window.shopXtools.productsWithPrices?.[localStorage.getItem("selectedCountryCode")]?.length || 0;
                const filteredProductsCount = window.shopXtools.products?.length || 0;
                
                return {
                  isFiltered: window.shopXtools.areProductsFiltered(),
                  activeFilters,
                  allProductsCount,
                  filteredProductsCount,
                  filterRate: allProductsCount ? Math.round((filteredProductsCount / allProductsCount) * 100) : 100
                };
              };
              
              window.shopXtools.clearFilters = () => {
                window.shopXtools.lastAppliedFilters = {
                  vendor: null,
                  collection: null,
                  productType: null,
                  tag: null
                };
                
                const countryCode = localStorage.getItem("selectedCountryCode");
                if (!countryCode) {
                  console.error("No country code available for product fetch");
                  return;
                }
                
                return window.shopXtools.fetchProductsByCountry(countryCode);
              };
              
              // Get filter settings from window.__FcCheckoutConfigs
              const fcConfig = window.__FcCheckoutConfigs || {};
              let vendor = null;
              let collection = null;
              let productType = null;
              let tag = null;
              
              // Check if filter settings exist in the config
              if (fcConfig.filterByVendor) {
                vendor = fcConfig.filterByVendor;
              }
              
              if (fcConfig.filterByCollection) {
                collection = fcConfig.filterByCollection;
              }
              
              if (fcConfig.filterByProductType) {
                productType = fcConfig.filterByProductType;
              }
              
              if (fcConfig.filterByTags) {
                tag = fcConfig.filterByTags;
              }
              
              // Update lastAppliedFilters with any settings we found
              window.shopXtools.lastAppliedFilters = {
                vendor: vendor,
                collection: collection,
                productType: productType,
                tag: tag
              };
              
              // Then fetch products with the correct country code and filters
              fetchProductsByCountry(
                storedCountryCode, 
                null, 
                vendor, 
                collection, 
                productType, 
                tag
              ).catch(error => {
                console.error('Error fetching products by country:', error);
                window.shopXtools.status = "ready";
              });
              
            } else {
                console.error('No country code available for product fetch');
            }
        }).catch(error => {
            console.error('Error during initialization:', error);
        });
      }
    
      window.__currencyMap = CURRENCIES;

      // Global Pop Fallback
      if (typeof window !== "undefined") {
        // console.log("running global fallback")
        window.addEventListener(
          "popstate",
          (event) => {
          const urlParams = new URLSearchParams(window.location.search)
          const hasVariant = urlParams.has("variant")
          const currentPath = window.location.pathname
          const urlHandle = currentPath.split("index.html").filter(Boolean).pop()
          const isProductPage = (
            Array.isArray(window.shopXtools?.products)
              ? window.shopXtools.products.some(({ node }) => node.handle === urlHandle)
              : false
          )
        
            // This fallback is ONLY for pages without VariantSelector (like homepage)
            if (isProductPage && hasVariant) {
              // We're going back to a product page with variant
              //console.log("We're going back to a product page with variant but VariantSelector isn't mounted to handle restore")
              event.stopImmediatePropagation()
              window.location.reload()
            }
          },
          true
        )
      }
      if (typeof window !== "undefined") {
        const cleanVariantData = () => {
          const urlParams = new URLSearchParams(window.location.search)
          const hasVariant = urlParams.has("variant")
          const currentPath = window.location.pathname
          const urlHandle = currentPath.split("index.html").filter(Boolean).pop()

          const isProductPage = (
            Array.isArray(window.shopXtools?.products)
              ? window.shopXtools.products.some(({ node }) => node.handle === urlHandle)
              : false
          )

          if (!isProductPage && hasVariant) {
            urlParams.delete("variant")
            const newUrl = `${window.location.pathname}${urlParams.toString() ? "?" + urlParams.toString() : ""}`;
            window.history.replaceState({}, "", newUrl)
            //console.log("Stripped ?variant from URL via navigation:", newUrl)
            try {
              for (let i = sessionStorage.length - 1; i >= 0; i--) {
                  const key = sessionStorage.key(i)
                  if (key && key.startsWith("fc_active_variant_")) {
                    sessionStorage.removeItem(key)
                    // console.log("Cleared variant from sessionStorage", key);
                  }
              }
            } catch (error) {
              console.error(
                "Error clearing variant from sessionStorage:",
                error
              )
            }
            
          }
          if (!isProductPage) {
            try {
              for (let i = sessionStorage.length - 1; i >= 0; i--) {
                  const key = sessionStorage.key(i)
                  if (key && key.startsWith("fc_active_variant_")) {
                    sessionStorage.removeItem(key)
                    // console.log("Cleared variant from sessionStorage", key);
                  }
              }
            } catch (error) {
              console.error(
                "Error clearing variant from sessionStorage:",
                error
              )
            }
          }
        }
        // Run on popstate (back/forward)
        window.addEventListener("popstate", cleanVariantData)

        // Patch pushState and replaceState to track all navigations
        const originalPushState = history.pushState
        const originalReplaceState = history.replaceState

        history.pushState = function (...args) {
          originalPushState.apply(this, args)
          cleanVariantData()
        }

        history.replaceState = function (...args) {
          originalReplaceState.apply(this, args)
          cleanVariantData()
        }
      }

      // ============================================================
      // Shopify Privacy API Consent Sync
      // ============================================================

      // Note: This attempts to sync Framer Cookie Banner consent to Shopify
      // Only works if domains are aligned (same root domain)
      // Falls back gracefully if not configured or domains misaligned

      (function initializeShopifyConsentSync() {
        // Check if we should attempt Shopify sync
        document.addEventListener('data__cart-updated', function(e) {
          if (!window.__FCShopifySyncInitialized && e.detail && e.detail.cart && e.detail.cart.checkoutUrl) {
            window.__FCShopifySyncInitialized = true;

            // Check domain alignment
            if (!window.FCDomainValidator.canShareCookies()) {
              console.warn('[FC Privacy] Shopify sync skipped: domains cannot share cookies. Run window.FCConsentManager.logShopifySync() for details.');
              return;
            }

            // Check if banner is present - only sync if user has made a choice
            if (!window.FCConsentManager.isBannerPresent()) {
              return;
            }

            // Load Shopify Privacy API
            const script = document.createElement('script');
            script.src = '../cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js';
            script.async = true;

            script.onload = function() {
              // Poll for window.Shopify.customerPrivacy to be available
              let attempts = 0;
              const maxAttempts = 50; // 5 seconds max

              const checkShopifyReady = function() {
                attempts++;

                if (typeof window.Shopify !== 'undefined' && typeof window.Shopify.customerPrivacy !== 'undefined') {
                  // Shopify Customer Privacy API is ready
                  // Sync initial consent if banner detected
                  syncConsentToShopify();

                  // Listen for consent changes via FCConsentManager (primary method)
                  if (window.FCConsentManager && typeof window.FCConsentManager.onConsentChange === 'function') {
                    window.FCConsentManager.onConsentChange(function(newConsent) {
                      syncConsentToShopify();
                    });
                  }

                  // Also listen for generic consent update events (backup)
                  window.addEventListener('cookie_consent_update', function() {
                    syncConsentToShopify();
                  });

                  // Also listen for dataLayer updates (backup)
                  if (window.dataLayer) {
                    const originalPush = window.dataLayer.push;
                    window.dataLayer.push = function() {
                      const result = originalPush.apply(window.dataLayer, arguments);
                      if (arguments[0] && typeof arguments[0] === 'object') {
                        const data = arguments[0];
                        if ('consent' in data || 'analytics_storage' in data || 'ad_storage' in data) {
                          setTimeout(function() {
                            syncConsentToShopify();
                          }, 100);
                        }
                      }
                      return result;
                    };
                  }
                } else if (attempts < maxAttempts) {
                  // Not ready yet, try again in 100ms
                  setTimeout(checkShopifyReady, 100);
                } else {
                  // Timeout - Shopify didn't load
                  console.error('[FC Privacy] Timeout waiting for window.Shopify.customerPrivacy');
                }
              };

              // Start checking
              checkShopifyReady();
            };

            script.onerror = function() {
              console.error('[FC Privacy] Failed to load Shopify Privacy API script');
            };

            document.head.appendChild(script);
          }
        });

        function syncConsentToShopify() {
          if (!window.Shopify || !window.Shopify.customerPrivacy) {
            return;
          }

          const consent = window.FCConsentManager.getConsent();

          // Only sync if banner detected (user made a choice)
          if (!consent.bannerDetected) {
            return;
          }

          const checkoutUrl = window.shopXtools?.cart?.checkoutUrl;
          if (!checkoutUrl) {
            return;
          }

          try {
            const checkoutDomain = new URL(checkoutUrl.html).hostname;
            const framerHostname = window.location.hostname;
            const rootDomain = window.FCDomainValidator.extractRootDomain(framerHostname);

            window.Shopify.customerPrivacy.setTrackingConsent(
              {
                sale_of_data: consent.marketing,
                analytics: consent.analytics,
                marketing: consent.marketing,
                preferences: consent.preferences,
                headlessStorefront: true,
                checkoutRootDomain: checkoutDomain,
                storefrontRootDomain: rootDomain,
                storefrontAccessToken: fcConfigs.storefrontAccessToken
              },
              function(error) {
                if (error) {
                  console.error('[FC Privacy] Error syncing consent to Shopify:', error);
                }
              }
            );
          } catch (error) {
            console.error('[FC Privacy] Error syncing consent:', error);
          }
        }
      })();

    })();
  
(()=>{function u(){function n(t,e,i){let r=document.createElement("a");r.href=t,r.target=i,r.rel=e,document.body.appendChild(r),r.click(),r.remove()}function o(t){if(this.dataset.hydrated){this.removeEventListener("click",o);return}t.preventDefault(),t.stopPropagation();let e=this.getAttribute("href");if(!e)return;if(/Mac|iPod|iPhone|iPad/u.test(navigator.userAgent)?t.metaKey:t.ctrlKey)return n(e,"","_blank");let r=this.getAttribute("rel")??"",c=this.getAttribute("target")??"";n(e,r,c)}function a(t){if(this.dataset.hydrated){this.removeEventListener("auxclick",o);return}t.preventDefault(),t.stopPropagation();let e=this.getAttribute("href");e&&n(e,"","_blank")}function s(t){if(this.dataset.hydrated){this.removeEventListener("keydown",s);return}if(t.key!=="Enter")return;t.preventDefault(),t.stopPropagation();let e=this.getAttribute("href");if(!e)return;let i=this.getAttribute("rel")??"",r=this.getAttribute("target")??"";n(e,i,r)}document.querySelectorAll("[data-nested-link]").forEach(t=>{t instanceof HTMLElement&&(t.addEventListener("click",o),t.addEventListener("auxclick",a),t.addEventListener("keydown",s))})}return u})()()
!function(){var w="framer_variant";function u(a,r){let e=r.indexOf("#"),t=e===-1?r:r.substring(0,e),o=e===-1?"":r.substring(e),n=t.indexOf("?"),h=n===-1?t:t.substring(0,n),d=n===-1?"":t.substring(n),s=new URLSearchParams(d),m=new URLSearchParams(a);for(let[i,l]of m)s.has(i)||i!==w&&s.append(i,l);let c=s.toString();return c===""?t+o:h+"?"+c+o}var g='div#main a[href^="#"],div#main a[href^="/"],div#main a[href^="."]',f="div#main a[data-framer-preserve-params]",S=document.currentScript?.hasAttribute("data-preserve-internal-params");if(window.location.search&&!navigator.webdriver&&!/bot|-google|google-|yandex|ia_archiver|crawl|spider/iu.test(navigator.userAgent)){let a=document.querySelectorAll(S?`${g},${f}`:f);for(let r of a){let e=u(window.location.search,r.href);r.setAttribute("href",e)}}
}()
var animator=(()=>{var O=(e,r,t)=>t>r?r:t<e?e:t;var j=()=>{};function W(e){let r;return()=>(r===void 0&&(r=e()),r)}var q=e=>e;var v=e=>e*1e3,V=e=>e/1e3;function X(e,r){return r?e*(1e3/r):0}var Y=e=>Array.isArray(e)&&typeof e[0]=="number";var H={value:null,addProjectionMetrics:null};var Z={layout:0,mainThread:0,waapi:0};var L=(e,r,t=10)=>{let o="",s=Math.max(Math.round(r/t),2);for(let n=0;n<s;n++)o+=Math.round(e(n/(s-1))*1e4)/1e4+", ";return`linear(${o.substring(0,o.length-2)})`};function R(e){let r=0,t=50,o=e.next(r);for(;!o.done&&r<2e4;)r+=t,o=e.next(r);return r>=2e4?1/0:r}function fe(e,r=100,t){let o=t({...e,keyframes:[0,r]}),s=Math.min(R(o),2e4);return{type:"keyframes",ease:n=>o.next(s*n).value/r,duration:V(s)}}var Ee=5;function ce(e,r,t){let o=Math.max(r-Ee,0);return X(t-e(o),r-o)}var u={stiffness:100,damping:10,mass:1,velocity:0,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05,maxDamping:1};var _=.001;function le({duration:e=u.duration,bounce:r=u.bounce,velocity:t=u.velocity,mass:o=u.mass}){let s,n;j(e<=v(u.maxDuration),"Spring duration must be 10 seconds or less","spring-duration-limit");let i=1-r;i=O(u.minDamping,u.maxDamping,i),e=O(u.minDuration,u.maxDuration,V(e)),i<1?(s=m=>{let p=m*i,c=p*e,l=p-t,x=z(m,i),g=Math.exp(-c);return _-l/x*g},n=m=>{let c=m*i*e,l=c*t+t,x=Math.pow(i,2)*Math.pow(m,2)*e,g=Math.exp(-c),y=z(Math.pow(m,2),i);return(-s(m)+_>0?-1:1)*((l-x)*g)/y}):(s=m=>{let p=Math.exp(-m*e),c=(m-t)*e+1;return-_+p*c},n=m=>{let p=Math.exp(-m*e),c=(t-m)*(e*e);return p*c});let f=5/e,a=Ce(s,n,f);if(e=v(e),isNaN(a))return{stiffness:u.stiffness,damping:u.damping,duration:e};{let m=Math.pow(a,2)*o;return{stiffness:m,damping:i*2*Math.sqrt(o*m),duration:e}}}var ke=12;function Ce(e,r,t){let o=t;for(let s=1;s<ke;s++)o=o-e(o)/r(o);return o}function z(e,r){return e*Math.sqrt(1-r*r)}var Be=["duration","bounce"],Ie=["stiffness","damping","mass"];function ue(e,r){return r.some(t=>e[t]!==void 0)}function Ke(e){let r={velocity:u.velocity,stiffness:u.stiffness,damping:u.damping,mass:u.mass,isResolvedFromDuration:!1,...e};if(!ue(e,Ie)&&ue(e,Be))if(r.velocity=0,e.visualDuration){let t=e.visualDuration,o=2*Math.PI/(t*1.2),s=o*o,n=2*O(.05,1,1-(e.bounce||0))*Math.sqrt(s);r={...r,mass:u.mass,stiffness:s,damping:n}}else{let t=le({...e,velocity:0});r={...r,...t,mass:u.mass},r.isResolvedFromDuration=!0}return r}function D(e=u.visualDuration,r=u.bounce){let t=typeof e!="object"?{visualDuration:e,keyframes:[0,1],bounce:r}:e,{restSpeed:o,restDelta:s}=t,n=t.keyframes[0],i=t.keyframes[t.keyframes.length-1],f={done:!1,value:n},{stiffness:a,damping:m,mass:p,duration:c,velocity:l,isResolvedFromDuration:x}=Ke({...t,velocity:-V(t.velocity||0)}),g=l||0,y=m/(2*Math.sqrt(a*p)),T=i-n,h=V(Math.sqrt(a/p)),K=Math.abs(T)<5;o||(o=K?u.restSpeed.granular:u.restSpeed.default),s||(s=K?u.restDelta.granular:u.restDelta.default);let S;if(y<1){let d=z(h,y);S=A=>{let b=Math.exp(-y*h*A);return i-b*((g+y*h*T)/d*Math.sin(d*A)+T*Math.cos(d*A))}}else if(y===1)S=d=>i-Math.exp(-h*d)*(T+(g+h*T)*d);else{let d=h*Math.sqrt(y*y-1);S=A=>{let b=Math.exp(-y*h*A),G=Math.min(d*A,300);return i-b*((g+y*h*T)*Math.sinh(G)+d*T*Math.cosh(G))/d}}let P={calculatedDuration:x&&c||null,next:d=>{let A=S(d);if(x)f.done=d>=c;else{let b=d===0?g:0;y<1&&(b=d===0?v(g):ce(S,d,A));let G=Math.abs(b)<=o,Oe=Math.abs(i-A)<=s;f.done=G&&Oe}return f.value=f.done?i:A,f},toString:()=>{let d=Math.min(R(P),2e4),A=L(b=>P.next(d*b).value,d,30);return d+"ms "+A},toTransition:()=>{}};return P}D.applyToOptions=e=>{let r=fe(e,100,D);return e.ease=r.ease,e.duration=v(r.duration),e.type="keyframes",e};var xe=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"],Q=new Set(xe);var de={};function ge(e,r){let t=W(e);return()=>de[r]??t()}var ye=ge(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"})}catch{return!1}return!0},"linearEasing");var w=([e,r,t,o])=>`cubic-bezier(${e}, ${r}, ${t}, ${o})`;var J={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:w([0,.65,.55,1]),circOut:w([.55,0,1,.45]),backIn:w([.31,.01,.66,-.59]),backOut:w([.33,1.53,.69,.99])};function ee(e,r){if(e)return typeof e=="function"?ye()?L(e,r):"ease-out":Y(e)?w(e):Array.isArray(e)?e.map(t=>ee(t,r)||J.easeOut):J[e]}function F(e,r,t,{delay:o=0,duration:s=300,repeat:n=0,repeatType:i="loop",ease:f="easeOut",times:a}={},m=void 0){let p={[r]:t};a&&(p.offset=a);let c=ee(f,s);Array.isArray(c)&&(p.easing=c),H.value&&Z.waapi++;let l={delay:o,duration:s,easing:Array.isArray(c)?"linear":c,fill:"both",iterations:n+1,direction:i==="reverse"?"alternate":"normal"};m&&(l.pseudoElement=m);let x=e.animate(p,l);return H.value&&x.finished.finally(()=>{Z.waapi--}),x}function Ae(e){return e.replace(/([A-Z])/g,r=>`-${r.toLowerCase()}`)}var N="framerAppearId",re="data-"+Ae(N);function te(e){return e.props[re]}var M=new Map,E=new Map;var k=(e,r)=>{let t=Q.has(r)?"transform":r;return`${e}: ${t}`};function oe(e,r,t){let o=k(e,r),s=M.get(o);if(!s)return null;let{animation:n,startTime:i}=s;function f(){window.MotionCancelOptimisedAnimation?.(e,r,t)}return n.onfinish=f,i===null||window.MotionHandoffIsComplete?.(e)?(f(),null):i}var $,C,ne=new Set;function Ge(){ne.forEach(e=>{e.animation.play(),e.animation.startTime=e.startTime}),ne.clear()}function ie(e,r,t,o,s){if(window.MotionIsMounted)return;let n=e.dataset[N];if(!n)return;window.MotionHandoffAnimation=oe;let i=k(n,r);C||(C=F(e,r,[t[0],t[0]],{duration:1e4,ease:"linear"}),M.set(i,{animation:C,startTime:null}),window.MotionHandoffAnimation=oe,window.MotionHasOptimisedAnimation=(a,m)=>{if(!a)return!1;if(!m)return E.has(a);let p=k(a,m);return!!M.get(p)},window.MotionHandoffMarkAsComplete=a=>{E.has(a)&&E.set(a,!0)},window.MotionHandoffIsComplete=a=>E.get(a)===!0,window.MotionCancelOptimisedAnimation=(a,m,p,c)=>{let l=k(a,m),x=M.get(l);x&&(p&&c===void 0?p.postRender(()=>{p.postRender(()=>{x.animation.cancel()})}):x.animation.cancel(),p&&c?(ne.add(x),p.render(Ge)):(M.delete(l),M.size||(window.MotionCancelOptimisedAnimation=void 0)))},window.MotionCheckAppearSync=(a,m,p)=>{let c=te(a);if(!c)return;let l=window.MotionHasOptimisedAnimation?.(c,m),x=a.props.values?.[m];if(!l||!x)return;let g=p.on("change",y=>{x.get()!==y&&(window.MotionCancelOptimisedAnimation?.(c,m),g())});return g});let f=()=>{C.cancel();let a=F(e,r,t,o);$===void 0&&($=performance.now()),a.startTime=$,M.set(i,{animation:a,startTime:$}),s&&s(a)};E.set(n,!1),C.ready?C.ready.then(f).catch(q):f()}var ae=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"],Le={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective"},Re={translateX:"px",translateY:"px",translateZ:"px",x:"px",y:"px",z:"px",perspective:"px",transformPerspective:"px",rotate:"deg",rotateX:"deg",rotateY:"deg"};function Te(e,r){let t=Re[e];return!t||typeof r=="string"&&r.endsWith(t)?r:`${r}${t}`}function se(e){return ae.includes(e)}var ze=(e,r)=>ae.indexOf(e)-ae.indexOf(r);function he({transform:e,transformKeys:r},t){let o={},s=!0,n="";r.sort(ze);for(let i of r){let f=e[i],a=!0;typeof f=="number"?a=f===(i.startsWith("scale")?1:0):a=parseFloat(f)===0,a||(s=!1,n+=`${Le[i]||i}(${e[i]}) `),t&&(o[i]=e[i])}return n=n.trim(),t?n=t(o,n):s&&(n="none"),n}function pe(e,r){let t=new Set(Object.keys(e));for(let o in r)t.add(o);return Array.from(t)}function me(e,r){let t=r-e.length;if(t<=0)return e;let o=new Array(t).fill(e[e.length-1]);return e.concat(o)}function B(e){return e*1e3}var be={duration:.001},I={opacity:1,scale:1,translateX:0,translateY:0,translateZ:0,x:0,y:0,z:0,rotate:0,rotateX:0,rotateY:0};function Ve(e,r,t,o,s){return t.delay&&(t.delay=B(t.delay)),t.type==="spring"?Ne(e,r,t,o,s):je(e,r,t,o,s)}function Fe(e,r,t){let o={},s=0,n=0;for(let i of pe(e,r)){let f=e[i]??I[i],a=r[i]??I[i];if(f===void 0||a===void 0||i!=="transformPerspective"&&f===a&&f===I[i])continue;i==="transformPerspective"&&(o[i]=[f,a]);let m=He(f,a,t),{duration:p,keyframes:c}=m;p===void 0||c===void 0||(p>s&&(s=p,n=c.length),o[i]=c)}return{keyframeValuesByProps:o,longestDuration:s,longestLength:n}}function Ne(e,r,t,o,s){let n={},{keyframeValuesByProps:i,longestDuration:f,longestLength:a}=Fe(e,r,t);if(!a)return n;let m={ease:"linear",duration:f,delay:t.delay},p=s?be:m,c={};for(let[x,g]of Object.entries(i))se(x)?c[x]=me(g,a):n[x]={keyframes:me(g,a),options:x==="opacity"?m:p};let l=De(c,o);return l&&(n.transform={keyframes:l,options:p}),n}function $e(e){let{type:r,duration:t,...o}=e;return{duration:B(t),...o}}function je(e,r,t,o,s){let n=$e(t);if(!n)return;let i={},f=s?be:n,a={};for(let p of pe(e,r)){let c=e[p]??I[p],l=r[p]??I[p];c===void 0||l===void 0||p!=="transformPerspective"&&c===l||(se(p)?a[p]=[c,l]:i[p]={keyframes:[c,l],options:p==="opacity"?n:f})}let m=De(a,o);return m&&(i.transform={keyframes:m,options:f}),i}var We=["duration","bounce"],qe=["stiffness","damping","mass"];function ve(e){return qe.some(r=>r in e)?!1:We.some(r=>r in e)}function Xe(e,r,t){return ve(t)?`${e}-${r}-${t.duration}-${t.bounce}`:`${e}-${r}-${t.damping}-${t.stiffness}-${t.mass}`}function Ye(e){return ve(e)?{...e,duration:B(e.duration)}:e}var Me=new Map,Se=10;function He(e,r,t){let o=Xe(e,r,t),s=Me.get(o);if(s)return s;let n=[e,r],i=D({...Ye(t),keyframes:n}),f={done:!1,value:n[0]},a=[],m=0;for(;!f.done&&m<B(10);)f=i.next(m),a.push(f.value),m+=Se;n=a;let p=m-Se,l={keyframes:n,duration:p,ease:"linear"};return Me.set(o,l),l}function De(e,r){let t=[],o=Object.values(e)[0]?.length;if(!o)return;let s=Object.keys(e);for(let n=0;n<o;n++){let i={};for(let[a,m]of Object.entries(e)){let p=m[n];p!==void 0&&(i[a]=Te(a,p))}let f=he({transform:i,transformKeys:s},r);t.push(f)}return t}function Ze(e,r){if(!r)for(let t in e){let o=e[t];return o?.legacy===!0?o:void 0}}function we(e,r,t,o,s,n){for(let[i,f]of Object.entries(e)){let a=n?f[n]:void 0;if(a===null||!a&&f.default===null)continue;let m=a??f.default??Ze(f,n);if(!m)continue;let{initial:p,animate:c,transformTemplate:l}=m;if(!p||!c)continue;let{transition:x,...g}=c,y=Ve(p,g,x,Ue(l,o),s);if(!y)continue;let T={},h={};for(let[S,P]of Object.entries(y))T[S]=P.keyframes,h[S]=P.options;let K=n?`:not(.hidden-${n}) `:"";r(`${K}[${t}="${i}"]`,T,h)}}function Ue(e,r){if(!(!e||!r))return(t,o)=>e.replace(r,o)}function Pe(e){return e?e.find(t=>t.mediaQuery?window.matchMedia(t.mediaQuery).matches===!0:!1)?.hash:void 0}var zt={animateAppearEffects:we,getActiveVariantHash:Pe,spring:D,startOptimizedAppearAnimation:ie};return zt})()
{"142k92h":{"default":{"initial":{"opacity":0.001,"rotate":0,"rotateX":0,"rotateY":0,"scale":1,"skewX":0,"skewY":0,"x":0,"y":10},"animate":{"opacity":1,"rotate":0,"rotateX":0,"rotateY":0,"scale":1,"skewX":0,"skewY":0,"transition":{"delay":1.2,"duration":0.4,"ease":[0.44,0,0.56,1],"type":"tween"},"x":0,"y":0}}}}
[{"hash":"3mbnjh","mediaQuery":"(min-width: 1200px)"},{"hash":"7dbul9","mediaQuery":"(min-width: 810px) and (max-width: 1199px)"},{"hash":"1vv5agx","mediaQuery":"(max-width: 809px)"},{"hash":"1ny9h75","mediaQuery":"(min-width: 1200px)"},{"hash":"1sln2t2","mediaQuery":"(min-width: 810px) and (max-width: 1199.98px)"},{"hash":"5k3q0m","mediaQuery":"(max-width: 809.98px)"}]
(()=>{function c(i,o,s){if(window.__framer_disable_appear_effects_optimization__||typeof animator>"u")return;let e={detail:{bg:document.hidden}};requestAnimationFrame(()=>{let a="framer-appear-start";performance.mark(a,e),animator.animateAppearEffects(JSON.parse(window.__framer__appearAnimationsContent.text),(m,p,d)=>{let t=document.querySelector(m);if(t)for(let[r,f]of Object.entries(p))animator.startOptimizedAppearAnimation(t,r,f,d[r])},i,o,s&&window.matchMedia("(prefers-reduced-motion:reduce)").matches===!0,animator.getActiveVariantHash(JSON.parse(window.__framer__breakpoints.text)));let n="framer-appear-end";performance.mark(n,e),performance.measure("framer-appear",{start:a,end:n,detail:e.detail})})}return c})()("data-framer-appear-id","__Appear_Animation_Transform__",false)
typeof document<"u"&&(window.process={...window.process,env:{...window.process?.env,NODE_ENV:"production"}});
[{"0":1,"1":2},["Map"],["Map",3,4,5,6,7,8],"getSlugByRecordId|P5ViAyb41|default|Yv5chn6eB","sage","getSlugByRecordId|xLswf_qdK|default|cj4oB_X7T","modern","getSlugByRecordId|VpI7X80Hv|default|TlRCCX7Nz","5-ways-scandinavian-design-can-transform-your-space"]