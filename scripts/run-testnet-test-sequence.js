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
    return false;
  }
}

async function runTestSequence() {
  console.log('🚀 Starting test execution sequence...');

  let hasFailures = false;
  const testSteps = [
    {
      command: 'npm run test-testnet-precondition',
      name: 'Precondition Tests',
    },
    { command: 'npm run test-testnet', name: 'Main Tests' },
    {
      command: 'npm run test-testnet-postcondition',
      name: 'Postcondition Tests',
    },
  ];

  for (const step of testSteps) {
    const success = runCommand(step.command, step.name);
    if (!success) {
      hasFailures = true;
    }
  }

  if (hasFailures) {
    console.log(
      '⚠️ Some test suites failed. Check the logs above for details.'
    );
    process.exit(1); // Exit with error code only after all suites have run
  } else {
    console.log('✨ All test sequences completed successfully!');
    process.exit(0);
  }
}

runTestSequence().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
