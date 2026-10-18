const { spawn } = require('child_process');

const deployment = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'docker'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

deployment.on('error', error => {
  console.error('Could not start the local smart-contract deployment.', error);
  process.exitCode = 1;
});

deployment.on('exit', code => {
  if (code !== 0) {
    process.exitCode = code || 1;
    return;
  }

  delete process.env.DEPLOYER_PRIVATE_KEY;

  const build = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  build.on('error', error => {
    console.error('Could not build the web application.', error);
    process.exitCode = 1;
  });
  build.on('exit', buildCode => {
    if (buildCode !== 0) {
      process.exitCode = buildCode || 1;
      return;
    }

    const app = spawn('npm', ['start'], {
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    app.on('error', error => {
      console.error('Could not start the web application and shared diagram API.', error);
      process.exitCode = 1;
    });
    app.on('exit', appCode => {
      process.exitCode = appCode || 0;
    });
  });
});
