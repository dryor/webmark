import { main } from './cli';

declare const __VERSION__: string;

main(process.argv, __VERSION__).then((code) => {
  process.exitCode = code;
});
