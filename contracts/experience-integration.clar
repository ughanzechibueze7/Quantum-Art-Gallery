;; Experience Integration Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_EXPERIENCE (err u101))

;; Data variables
(define-data-var experience-count uint u0)

;; Data maps
(define-map experiences
  uint
  {
    creator: principal,
    artwork-id: uint,
    vr-metadata: (string-utf8 1024),
    ar-metadata: (string-utf8 1024),
    quantum-seed: (buff 32)
  }
)

;; Public functions
(define-public (create-experience (artwork-id uint) (vr-metadata (string-utf8 1024)) (ar-metadata (string-utf8 1024)))
  (let
    (
      (experience-id (+ (var-get experience-count) u1))
      (artwork (unwrap! (contract-call? .quantum-art-management get-artwork artwork-id) ERR_INVALID_EXPERIENCE))
      (quantum-seed (generate-quantum-seed))
    )
    (asserts! (is-eq tx-sender (get creator artwork)) ERR_NOT_AUTHORIZED)
    (map-set experiences
      experience-id
      {
        creator: tx-sender,
        artwork-id: artwork-id,
        vr-metadata: vr-metadata,
        ar-metadata: ar-metadata,
        quantum-seed: quantum-seed
      }
    )
    (var-set experience-count experience-id)
    (ok experience-id)
  )
)

(define-public (update-experience (experience-id uint) (vr-metadata (string-utf8 1024)) (ar-metadata (string-utf8 1024)))
  (let
    (
      (experience (unwrap! (map-get? experiences experience-id) ERR_INVALID_EXPERIENCE))
    )
    (asserts! (is-eq tx-sender (get creator experience)) ERR_NOT_AUTHORIZED)
    (ok (map-set experiences
      experience-id
      (merge experience {
        vr-metadata: vr-metadata,
        ar-metadata: ar-metadata
      })
    ))
  )
)

;; Read-only functions
(define-read-only (get-experience (experience-id uint))
  (map-get? experiences experience-id)
)

(define-read-only (get-experience-count)
  (var-get experience-count)
)

;; Internal functions
(define-private (generate-quantum-seed)
  (sha256 (concat (unwrap-panic (get-block-info? header-hash (- block-height u1)))
                  (int-to-ascii (var-get experience-count))))
)

