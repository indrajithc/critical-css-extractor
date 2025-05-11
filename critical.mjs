import { generate} from 'critical';

const runCritical = async () => {
  try {
   const response = await generate({
      base: './',
      src: 'index.html',        // 👈 This is used
      // dest: 'index.critical.html',
      inline: false,
      // minify: true,
      width: 1300,
      height: 900,
    });

    console.log({ response })
    console.log('Critical CSS generated.');
  } catch (err) {
    console.error('Critical CSS generation failed:', err);
  }
};

runCritical();