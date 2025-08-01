/**
 * Build Script for Chiral Static Client
 * 
 * Concatenates and minifies all core modules into a single distributable file.
 * Supports both development and production builds.
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

// Configuration
const isDev = process.argv.includes('--dev');
const isProd = process.argv.includes('--prod') || (!isDev && process.env.NODE_ENV === 'production');

const config = {
  srcDir: path.join(__dirname, '..', 'core'),
  assetsDir: path.join(__dirname, '..', 'assets'),
  distDir: path.join(__dirname, '..', 'dist'),
  
  // File order matters for dependencies
  jsFiles: [
    'utils.js',
    'cache.js', 
    'config.js',
    'i18n.js',
    'api.js',
    'display.js'
  ],
  
  cssFiles: [
    'chiral-client.css'
  ]
};

// Ensure dist directory exists
if (!fs.existsSync(config.distDir)) {
  fs.mkdirSync(config.distDir, { recursive: true });
}

/**
 * Read file with error handling
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return '';
  }
}

/**
 * Write file with error handling
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Written: ${filePath}`);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
  }
}

/**
 * Build JavaScript bundle
 */
async function buildJS() {
  console.log('Building JavaScript bundle...');
  
  let bundle = '';
  
  // Add header comment
  bundle += `/**
 * Chiral Static Client - Complete Bundle
 * 
 * Version: 1.0.0
 * Build: ${new Date().toISOString()}
 * Mode: ${isDev ? 'development' : 'production'}
 * 
 * This file contains all necessary modules for the Chiral Static Client.
 * It can be included directly in static sites without any build process.
 */

`;

  // Concatenate core modules
  for (const file of config.jsFiles) {
    const filePath = path.join(config.srcDir, file);
    const content = readFile(filePath);
    
    if (content) {
      bundle += `\n/* === ${file} === */\n`;
      bundle += content;
      bundle += '\n';
    }
  }
  
  // Add main entry point
  const mainEntry = path.join(config.assetsDir, 'chiral-client.js');
  const mainContent = readFile(mainEntry);
  if (mainContent) {
    bundle += '\n/* === Main Entry Point === */\n';
    bundle += mainContent;
  }

  // Write development bundle
  const devPath = path.join(config.distDir, 'chiral-client.js');
  writeFile(devPath, bundle);
  
  // Create minified version for production
  if (isProd || !isDev) {
    try {
      console.log('Minifying JavaScript...');
      const minified = await minify(bundle, {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.warn']
        },
        mangle: {
          reserved: ['ChiralClient', 'ChiralConfig', 'ChiralAPI', 'ChiralDisplay', 'ChiralCache', 'ChiralI18n', 'ChiralUtils']
        },
        format: {
          comments: /^!|@preserve|@license|@cc_on/i
        }
      });
      
      if (minified.error) {
        console.error('Minification error:', minified.error);
      } else {
        const prodPath = path.join(config.distDir, 'chiral-client.min.js');
        writeFile(prodPath, minified.code);
        
        // Calculate size reduction
        const originalSize = Buffer.byteLength(bundle, 'utf8');
        const minifiedSize = Buffer.byteLength(minified.code, 'utf8');
        const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        console.log(`✓ Minified: ${originalSize} → ${minifiedSize} bytes (${reduction}% reduction)`);
      }
    } catch (error) {
      console.error('Minification failed:', error.message);
    }
  }
}

/**
 * Build CSS bundle
 */
function buildCSS() {
  console.log('Building CSS bundle...');
  
  let bundle = '';
  
  // Add header comment
  bundle += `/**
 * Chiral Static Client - Complete CSS
 * 
 * Version: 1.0.0
 * Build: ${new Date().toISOString()}
 * Mode: ${isDev ? 'development' : 'production'}
 */

`;

  // Concatenate CSS files
  for (const file of config.cssFiles) {
    const filePath = path.join(config.assetsDir, file);
    const content = readFile(filePath);
    
    if (content) {
      bundle += `\n/* === ${file} === */\n`;
      bundle += content;
      bundle += '\n';
    }
  }

  // Write development bundle
  const devPath = path.join(config.distDir, 'chiral-client.css');
  writeFile(devPath, bundle);
  
  // Create minified version for production
  if (isProd || !isDev) {
    try {
      console.log('Minifying CSS...');
      const cleanCSS = new CleanCSS({
        level: 2,
        returnPromise: false
      });
      
      const minified = cleanCSS.minify(bundle);
      
      if (minified.errors.length > 0) {
        console.error('CSS minification errors:', minified.errors);
      } else {
        const prodPath = path.join(config.distDir, 'chiral-client.min.css');
        writeFile(prodPath, minified.styles);
        
        // Calculate size reduction
        const originalSize = Buffer.byteLength(bundle, 'utf8');
        const minifiedSize = Buffer.byteLength(minified.styles, 'utf8');
        const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        console.log(`✓ Minified CSS: ${originalSize} → ${minifiedSize} bytes (${reduction}% reduction)`);
      }
    } catch (error) {
      console.error('CSS minification failed:', error.message);
    }
  }
}

/**
 * Copy examples and documentation
 */
function copyFiles() {
  console.log('Copying additional files...');
  
  // Copy package.json
  const packageJson = readFile(path.join(__dirname, '..', 'package.json'));
  if (packageJson) {
    writeFile(path.join(config.distDir, 'package.json'), packageJson);
  }
  
  // Copy README if it exists
  const readmePath = path.join(__dirname, '..', 'README.md');
  if (fs.existsSync(readmePath)) {
    const readme = readFile(readmePath);
    writeFile(path.join(config.distDir, 'README.md'), readme);
  }
}

/**
 * Main build function
 */
async function build() {
  console.log(`\n🔨 Building Chiral Static Client (${isDev ? 'development' : 'production'})...\n`);
  
  const startTime = Date.now();
  
  try {
    await buildJS();
    buildCSS();
    copyFiles();
    
    const buildTime = Date.now() - startTime;
    console.log(`\n✅ Build completed in ${buildTime}ms`);
    
    // Show output files
    console.log('\n📦 Output files:');
    const files = fs.readdirSync(config.distDir);
    files.forEach(file => {
      const filePath = path.join(config.distDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${file} (${stats.size} bytes)`);
    });
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build
if (require.main === module) {
  build();
}

module.exports = { build, config }; 