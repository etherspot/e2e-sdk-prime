import { execSync } from 'child_process';

function runCommand(command, stepName) {
  try {
    console.log(`\n📍 Starting ${stepName}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${stepName} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${stepName} failed with error:`);
    console.error(error.message);
    process.exit(1); // This will make the CI pipeline fail
    return false;
  }
}

// Execute commands in sequence
console.log('🚀 Starting test execution sequence...');

// Run precondition tests
runCommand('npm run test-mainnet-precondition', 'Precondition Tests');

// Run main tests
runCommand('npm run test-mainnet', 'Main Tests');

// Run postcondition tests
runCommand('npm run test-mainnet-postcondition', 'Postcondition Tests');

console.log('✨ All test sequences completed successfully!');
