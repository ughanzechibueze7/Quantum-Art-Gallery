;; Quantum Art NFT Contract

(define-non-fungible-token quantum-art-nft uint)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_NFT (err u101))

;; Data variables
(define-data-var last-token-id uint u0)

;; Data maps
(define-map token-metadata
  uint
  {
    creator: principal,
    artwork-id: uint,
    title: (string-ascii 64),
    quantum-signature: (buff 32),
    creation-time: uint
  }
)

;; Public functions
(define-public (mint-nft (artwork-id uint))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
      (artwork (unwrap! (contract-call? .quantum-art-management get-artwork artwork-id) ERR_INVALID_NFT))
    )
    (asserts! (is-eq tx-sender (get creator artwork)) ERR_NOT_AUTHORIZED)
    (try! (nft-mint? quantum-art-nft token-id tx-sender))
    (map-set token-metadata
      token-id
      {
        creator: tx-sender,
        artwork-id: artwork-id,
        title: (get title artwork),
        quantum-signature: (get quantum-signature artwork),
        creation-time: block-height
      }
    )
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-public (transfer-nft (token-id uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (unwrap! (nft-get-owner? quantum-art-nft token-id) ERR_INVALID_NFT)) ERR_NOT_AUTHORIZED)
    (try! (nft-transfer? quantum-art-nft token-id tx-sender recipient))
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-token-metadata (token-id uint))
  (map-get? token-metadata token-id)
)

(define-read-only (get-token-owner (token-id uint))
  (nft-get-owner? quantum-art-nft token-id)
)

(define-read-only (get-last-token-id)
  (var-get last-token-id)
)

