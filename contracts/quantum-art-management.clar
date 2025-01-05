;; Quantum Art Management Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_ARTWORK (err u101))
(define-constant ERR_INVALID_VIEWER (err u102))

;; Data variables
(define-data-var artwork-count uint u0)

;; Data maps
(define-map artworks
  uint
  {
    creator: principal,
    title: (string-ascii 64),
    description: (string-utf8 256),
    quantum-signature: (buff 32),
    creation-time: uint,
    viewing-price: uint
  }
)

(define-map viewing-rights
  { artwork-id: uint, viewer: principal }
  { expiration: uint }
)

;; Public functions
(define-public (create-artwork (title (string-ascii 64)) (description (string-utf8 256)) (quantum-signature (buff 32)) (viewing-price uint))
  (let
    (
      (artwork-id (+ (var-get artwork-count) u1))
    )
    (map-set artworks
      artwork-id
      {
        creator: tx-sender,
        title: title,
        description: description,
        quantum-signature: quantum-signature,
        creation-time: block-height,
        viewing-price: viewing-price
      }
    )
    (var-set artwork-count artwork-id)
    (ok artwork-id)
  )
)

(define-public (update-viewing-price (artwork-id uint) (new-price uint))
  (let
    (
      (artwork (unwrap! (map-get? artworks artwork-id) ERR_INVALID_ARTWORK))
    )
    (asserts! (is-eq tx-sender (get creator artwork)) ERR_NOT_AUTHORIZED)
    (ok (map-set artworks
      artwork-id
      (merge artwork { viewing-price: new-price })
    ))
  )
)

(define-public (purchase-viewing-rights (artwork-id uint))
  (let
    (
      (artwork (unwrap! (map-get? artworks artwork-id) ERR_INVALID_ARTWORK))
      (viewing-price (get viewing-price artwork))
    )
    (try! (stx-transfer? viewing-price tx-sender (get creator artwork)))
    (ok (map-set viewing-rights
      { artwork-id: artwork-id, viewer: tx-sender }
      { expiration: (+ block-height u1440) } ;; Set expiration to 1 day (assuming 1 block per minute)
    ))
  )
)

;; Read-only functions
(define-read-only (get-artwork (artwork-id uint))
  (map-get? artworks artwork-id)
)

(define-read-only (get-viewing-rights (artwork-id uint) (viewer principal))
  (map-get? viewing-rights { artwork-id: artwork-id, viewer: viewer })
)

(define-read-only (get-artwork-count)
  (var-get artwork-count)
)

