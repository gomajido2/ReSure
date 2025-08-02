;; ReSure Coverage Agreement Contract
;; Clarity v2

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-NOT-FOUND u101)
(define-constant ERR-INVALID-STATE u102)
(define-constant ERR-ALREADY-EXISTS u103)
(define-constant ERR-NOT-PAYABLE u104)
(define-constant ERR-NOT-ACTIVE u105)
(define-constant ERR-NOT-ELIGIBLE u106)

;; Contract administrator
(define-data-var admin principal tx-sender)

;; Data structure to represent a coverage agreement
(define-map coverage-agreements
  { id: uint }
  {
    insurer: principal,
    capital-provider: principal,
    premium: uint,
    coverage-amount: uint,
    duration-blocks: uint,
    start-block: uint,
    active: bool,
    paid-out: bool
  }
)

(define-data-var agreement-counter uint u0)

;; PRIVATE HELPERS
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

(define-private (get-next-id)
  (let ((next-id (+ u1 (var-get agreement-counter))))
    (var-set agreement-counter next-id)
    next-id
  )
)

;; PUBLIC FUNCTIONS

;; Admin can transfer ownership
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)

;; Create a new coverage agreement
(define-public (create-agreement 
  (capital-provider principal)
  (premium uint)
  (coverage-amount uint)
  (duration-blocks uint))
  (let ((id (get-next-id)))
    (map-set coverage-agreements { id: id }
      {
        insurer: tx-sender,
        capital-provider: capital-provider,
        premium: premium,
        coverage-amount: coverage-amount,
        duration-blocks: duration-blocks,
        start-block: block-height,
        active: true,
        paid-out: false
      })
    (ok id)
  )
)

;; Read agreement info
(define-read-only (get-agreement (id uint))
  (match (map-get? coverage-agreements { id: id })
    entry (ok entry)
    (err ERR-NOT-FOUND)
  )
)

;; Cancel an agreement (only by insurer before expiration)
(define-public (cancel-agreement (id uint))
  (match (map-get? coverage-agreements { id: id })
    agreement
      (begin
        (asserts! (is-eq (get insurer agreement) tx-sender) (err ERR-NOT-AUTHORIZED))
        (asserts! (get active agreement) (err ERR-INVALID-STATE))
        (asserts! (< block-height (+ (get start-block agreement) (get duration-blocks agreement))) (err ERR-INVALID-STATE))
        (map-set coverage-agreements { id: id }
          (merge agreement { active: false }))
        (ok true)
      )
    (err ERR-NOT-FOUND)
  )
)

;; Mark agreement as paid out
(define-public (trigger-payout (id uint))
  (match (map-get? coverage-agreements { id: id })
    agreement
      (begin
        (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
        (asserts! (get active agreement) (err ERR-NOT-ACTIVE))
        (map-set coverage-agreements { id: id }
          (merge agreement {
            active: false,
            paid-out: true
          }))
        (ok (get coverage-amount agreement))
      )
    (err ERR-NOT-FOUND)
  )
)

;; Read-only: Check if agreement is active and not expired
(define-read-only (is-valid (id uint))
  (match (map-get? coverage-agreements { id: id })
    agreement
      (ok (and (get active agreement)
               (<= block-height (+ (get start-block agreement) (get duration-blocks agreement)))))
    (err ERR-NOT-FOUND)
  )
)

;; Read-only: Who is the admin?
(define-read-only (get-admin)
  (ok (var-get admin))
)

;; Read-only: Total agreements created
(define-read-only (get-agreement-count)
  (ok (var-get agreement-counter))
) ;; >100 lines
