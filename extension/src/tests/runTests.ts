import { runAdapterTests } from './adapters.test';
import { runReadmeTests } from './readme.test';

console.log('--- CP Vault Automated Test Suite ---');
const adapterResults = runAdapterTests();
const readmeResults = runReadmeTests();

const allResults = [...adapterResults, ...readmeResults];
let failedCount = 0;

allResults.forEach(r => {
  if (r.success) {
    console.log(`[PASS] ${r.name}`);
  } else {
    console.error(`[FAIL] ${r.name}: ${r.error}`);
    failedCount++;
  }
});

console.log('-------------------------------------');
console.log(`Summary: ${allResults.length - failedCount} passed, ${failedCount} failed.`);
if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
