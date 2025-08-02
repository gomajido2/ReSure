import { describe, it, expect, beforeEach } from 'vitest';

type Agreement = {
  id: number;
  insurer: string;
  insured: string;
  premium: bigint;
  coverageAmount: bigint;
  startBlock: number;
  duration: number;
  state: 'Pending' | 'Active' | 'Cancelled' | 'Payout';
  paidOut: boolean;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: number };

const mockContract = {
  admin: 'ST1ADMIN1234567890ADMIN000000000000000',
  agreements: new Map<number, Agreement>(),
  currentId: 0,
  blockHeight: 100,
  errors: {
    NOT_AUTHORIZED: 100,
    INVALID_ID: 101,
    INVALID_STATE: 102,
    ALREADY_PAID: 103,
    EXPIRED: 104,
  },

  getBlockHeight() {
    return this.blockHeight;
  },

  mineBlocks(count: number) {
    this.blockHeight += count;
  },

  isAdmin(sender: string) {
    return sender === this.admin;
  },

  createAgreement(
    insurer: string,
    insured: string,
    premium: bigint,
    coverageAmount: bigint,
    duration: number
  ): Result<number> {
    const id = this.currentId++;
    this.agreements.set(id, {
      id,
      insurer,
      insured,
      premium,
      coverageAmount,
      startBlock: this.getBlockHeight(),
      duration,
      state: 'Active',
      paidOut: false,
    });
    return { ok: true, value: id };
  },

  cancelAgreement(sender: string, id: number): Result<boolean> {
    const agreement = this.agreements.get(id);
    if (!agreement) return { ok: false, error: this.errors.INVALID_ID };
    if (agreement.state !== 'Active') return { ok: false, error: this.errors.INVALID_STATE };
    if (sender !== agreement.insurer) return { ok: false, error: this.errors.NOT_AUTHORIZED };
    if (this.getBlockHeight() > agreement.startBlock + agreement.duration) {
      return { ok: false, error: this.errors.EXPIRED };
    }
    agreement.state = 'Cancelled';
    return { ok: true, value: true };
  },

  triggerPayout(sender: string, id: number): Result<boolean> {
    const agreement = this.agreements.get(id);
    if (!agreement) return { ok: false, error: this.errors.INVALID_ID };
    if (!this.isAdmin(sender)) return { ok: false, error: this.errors.NOT_AUTHORIZED };
    if (agreement.paidOut) return { ok: false, error: this.errors.ALREADY_PAID };

    agreement.state = 'Payout';
    agreement.paidOut = true;
    return { ok: true, value: true };
  },

  getAgreement(id: number): Result<Agreement> {
    const agreement = this.agreements.get(id);
    if (!agreement) return { ok: false, error: this.errors.INVALID_ID };
    return { ok: true, value: agreement };
  },

  getAgreementCount(): number {
    return this.agreements.size;
  },
};

describe('Coverage Agreement Contract', () => {
  beforeEach(() => {
    mockContract.agreements.clear();
    mockContract.currentId = 0;
    mockContract.blockHeight = 100;
  });

  it('should create a new agreement successfully', () => {
    const result = mockContract.createAgreement(
      'STINSURE123',
      'STINSURED456',
      500n,
      1000n,
      20
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toBe(0);

    const agreement = mockContract.getAgreement(0);
    expect(agreement.ok).toBe(true);
    if (!agreement.ok || !agreement.value) throw new Error('Expected agreement to exist');
    expect(agreement.value.state).toBe('Active');
    expect(agreement.value.coverageAmount).toBe(1000n);
  });

  it('should cancel agreement by insurer before expiry', () => {
    const idResult = mockContract.createAgreement(
      'STINSURE123',
      'STINSURED456',
      500n,
      1000n,
      10
    );
    if (!idResult.ok) throw new Error('Failed to create agreement');
    const cancelResult = mockContract.cancelAgreement('STINSURE123', idResult.value);
    expect(cancelResult).toEqual({ ok: true, value: true });

    const agreement = mockContract.getAgreement(idResult.value);
    if (!agreement.ok || !agreement.value) throw new Error('Expected agreement to exist');
    expect(agreement.value.state).toBe('Cancelled');
  });

  it('should reject cancel by non-insurer', () => {
    const idResult = mockContract.createAgreement(
      'STINSURE123',
      'STINSURED456',
      500n,
      1000n,
      10
    );
    if (!idResult.ok) throw new Error('Failed to create agreement');
    const cancelResult = mockContract.cancelAgreement('STOTHER789', idResult.value);
    expect(cancelResult).toEqual({ ok: false, error: mockContract.errors.NOT_AUTHORIZED });
  });

  it('should reject cancel after expiry', () => {
    const idResult = mockContract.createAgreement(
      'STINSURE123',
      'STINSURED456',
      500n,
      1000n,
      5
    );
    if (!idResult.ok) throw new Error('Failed to create agreement');

    mockContract.mineBlocks(6);
    const cancelResult = mockContract.cancelAgreement('STINSURE123', idResult.value);
    expect(cancelResult).toEqual({ ok: false, error: mockContract.errors.EXPIRED });
  });

  it('should trigger payout by admin', () => {
    const idResult = mockContract.createAgreement(
      'STINSURE123',
      'STINSURED456',
      500n,
      5000n,
      15
    );
    if (!idResult.ok) throw new Error('Failed to create agreement');
    const payout = mockContract.triggerPayout(mockContract.admin, idResult.value);
    expect(payout).toEqual({ ok: true, value: true });

    const agreement = mockContract.getAgreement(idResult.value);
    if (!agreement.ok || !agreement.value) throw new Error('Expected agreement to exist');
    expect(agreement.value.state).toBe('Payout');
    expect(agreement.value.paidOut).toBe(true);
  });

  it('should reject payout by non-admin', () => {
    const idResult = mockContract.createAgreement(
      'STINSURE123',
      'STINSURED456',
      500n,
      3000n,
      15
    );
    if (!idResult.ok) throw new Error('Failed to create agreement');
    const payout = mockContract.triggerPayout('STNOTADMIN999', idResult.value);
    expect(payout).toEqual({ ok: false, error: mockContract.errors.NOT_AUTHORIZED });
  });

  it('should prevent double payouts', () => {
    const idResult = mockContract.createAgreement(
      'STINSURE123',
      'STINSURED456',
      500n,
      3000n,
      15
    );
    if (!idResult.ok) throw new Error('Failed to create agreement');
    mockContract.triggerPayout(mockContract.admin, idResult.value);
    const payout2 = mockContract.triggerPayout(mockContract.admin, idResult.value);
    expect(payout2).toEqual({ ok: false, error: mockContract.errors.ALREADY_PAID });
  });

  it('should correctly count agreements', () => {
    mockContract.createAgreement('A', 'B', 100n, 500n, 10);
    mockContract.createAgreement('A', 'C', 200n, 1000n, 20);
    expect(mockContract.getAgreementCount()).toBe(2);
  });
});
