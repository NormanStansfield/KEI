const { FuseBox,
        CSSPlugin,
        SassPlugin,
        HTMLPlugin,
        WebIndexPlugin,
        QuantumPlugin,
        UglifyJSPlugin,
        EnvPlugin,
        Sparky
} = require("fuse-box/es6");
// } = require("fuse-box");
//const StubPlugin = require('proxyrequire').FuseBoxStubPlugin(/toolbar.ts/);
const StubPlugin = require('proxyrequire').FuseBoxStubPlugin();

const express = require("express");
const path = require("path");

//const { spawn } = require("child_process");
const { spawn } = require("cross-spawn");


let isProduction = false;


// Renderer process
Sparky.task('renderer', ['copy:rdr:resources'], () => {

  const fuse = FuseBox.init({
    homeDir: 'src/',
    output: 'released/$name.js',
    target : "electron",

    sourceMaps: !isProduction,
    useTypescriptCompiler : true,
    plugins: [
      EnvPlugin({ NODE_ENV: isProduction ? "production" : "development" }),
      StubPlugin,
      [SassPlugin(), CSSPlugin()],
      CSSPlugin(),
      isProduction && UglifyJSPlugin(),
      WebIndexPlugin({
        path: ".",
        template: './src/html/index.html'
      })
    ],
    cache: !isProduction
  });

  if (!isProduction) {
    // Configure development server
    fuse.dev({ root: false, port: 4444 }, server => {
      const dist = path.join(__dirname, "released");
      const app = server.httpServer.app;
      app.use("/released/", express.static(dist));
      app.get("*", function(req, res) {
        res.sendFile(path.join(dist, "index.html"));
      });
    });
  }

  const app = fuse
  .bundle('renderer')
  .instructions(`> [ts/renderer/index.ts]`);
// NG  .instructions(`> ts/renderer/index.ts`);

  if (!isProduction) {
    app
    .watch()
    .hmr({reload : true});
  }

  return fuse.run();
});

// Main process
Sparky.task('main', () => {

  const fuse = FuseBox.init({
    homeDir: 'src/',
    output: 'released/$name.js',
    target : "server",

    sourceMaps: !isProduction,
    useTypescriptCompiler : true,
    plugins: [
      EnvPlugin({ NODE_ENV: isProduction ? "production" : "development" }),
      isProduction && QuantumPlugin({
        bakeApiIntoBundle : 'main',
        target : 'server',
        treeshake: true,
        removeExportsInterop: false,
        uglify: true
      })
    ],
    cache: !isProduction
  });

  const app = fuse
  .bundle('main')
// NG .instructions(`> ts/main/main.ts`);
  .instructions(`> [ts/main/main.ts]`);

  if (!isProduction) {
    app
    .watch();

    return fuse.run().then(() => {
      const nodemoncli = path.join(__dirname, 'node_modules', 'nodemon', 'bin', 'nodemon.js')
      const elecli = path.join(__dirname, 'node_modules', 'electron', 'cli.js')
      const child = spawn(nodemoncli, ['--watch', path.join(__dirname, 'released', 'main.js'), '--exec', elecli,  __dirname ], {
//        env: Object.assign(process.env, { NODE_ENV: "development" }),
      });

      child.stdout.on('data', function(data) {
        console.log(data.toString());
      });
      child.stderr.on('data', function(data) {
        console.error(data.toString());
      });
    });
  };

  return fuse.run();
});

// Default : For development
Sparky.task('default', ['renderer', 'main'], () => {});
// Default : For production
Sparky.task('prod', ['set-production', 'renderer', 'main'], () => {});
// Copy resources for renderer process
Sparky.task('copy:rdr:resources', async () => {
  await Sparky.src('about.html', { base: 'src/html' })
  .dest('released/')
  .exec();
  await Sparky.src('**/*', { base: 'src/html/fonts' })
  .dest('released/fonts')
  .exec();
  await Sparky.src('**/*', { base: 'src/html/css' })
  .dest('released/css')
  .exec();
});
// Remove released files
Sparky.task("clean:released", () => Sparky.src("released/*").clean("released/"));
// Remove fuse-box cache
Sparky.task("clean:cache", () => Sparky.src(".fusebox/*").clean(".fusebox/"));
// Cleanup
Sparky.task('clean', ['&clean:released', '&clean:cache'], () => {})
// For release
Sparky.task('release', ['set-production', 'clean:released', 'clean:cache', 'renderer', 'main'], () => {})
// Set production flag
Sparky.task('set-production', () =>  {isProduction = true})

