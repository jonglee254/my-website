import assert from 'node:assert';
import test from 'node:test';
import { RegionManager } from './libs/region-utils/index';
import { CryptoPaymentsAdapter } from './services/payments-aggregator/src/adapters/crypto.adapter';
import { SkrillPaymentsAdapter } from './services/payments-aggregator/src/adapters/skrill.adapter';
import { NetellerPaymentsAdapter } from './services/payments-aggregator/src/adapters/neteller.adapter';

test('RegionManager loads regional configurations', () => {
  const usConfig = RegionManager.getRegionConfig('US');
  assert.strictEqual(usConfig.region_code, 'US');
  assert.strictEqual(usConfig.registration_fee_usd, 20.00);

  const euConfig = RegionManager.getRegionConfig('EU');
  assert.strictEqual(euConfig.currency, 'EUR');

  const inConfig = RegionManager.getRegionConfig('IN');
  assert.strictEqual(inConfig.compliance.pan_aadhaar_required, true);
});

test('RegionManager validates KYC depth per region for crypto', () => {
  // US requires TIER1_VERIFIED
  assert.doesNotThrow(() => {
    RegionManager.assertKYCRequirement('US', 'TIER1_VERIFIED');
  });

  // EU requires TIER2_VERIFIED
  assert.throws(() => {
    RegionManager.assertKYCRequirement('EU', 'TIER1_VERIFIED');
  }, /requires KYC level 'TIER2_VERIFIED'/);
});

test('Payment Adapters initialize 20 USD registration flows', async () => {
  // 1. Crypto Adapter
  const cryptoAdapter = new CryptoPaymentsAdapter();
  const cryptoRes = await cryptoAdapter.initiatePayment({
    donor_id: 'test-donor-1',
    region_code: 'US',
    amount_usd: 20.00,
    method: 'CRYPTO',
    asset: 'USDC',
  });
  assert.strictEqual(cryptoRes.status, 'PENDING');
  assert.strictEqual(cryptoRes.next_step.type, 'CRYPTO_DEPOSIT');
  assert.ok(cryptoRes.next_step.deposit_address);

  // 2. Skrill Adapter
  const skrillAdapter = new SkrillPaymentsAdapter();
  const skrillRes = await skrillAdapter.initiatePayment({
    donor_id: 'test-donor-2',
    region_code: 'EU',
    amount_usd: 20.00,
    method: 'SKRILL',
  });
  assert.strictEqual(skrillRes.status, 'PENDING');
  assert.ok(skrillRes.next_step.checkout_url?.includes('pay.skrill.com'));

  // 3. Neteller Adapter
  const netellerAdapter = new NetellerPaymentsAdapter();
  const netellerRes = await netellerAdapter.initiatePayment({
    donor_id: 'test-donor-3',
    region_code: 'IN',
    amount_usd: 20.00,
    method: 'NETELLER',
  });
  assert.strictEqual(netellerRes.status, 'PENDING');
  assert.ok(netellerRes.next_step.checkout_url?.includes('pay.neteller.com'));
});
