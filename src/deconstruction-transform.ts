import {
  AsyncTransformStream
} from 'polymer-build/lib/streams';
import * as File from 'vinyl';

export abstract class DeconstructionTransform extends AsyncTransformStream<File, File> {
  constructor() {
    super({ objectMode: true });
  }

  protected abstract async deconstruct(file: File): Promise<File[]>;

  async * _transformIter(files: AsyncIterable<File>): AsyncIterable<File> {
    for await (const file of files) {
      const deconstructedFiles = await this.deconstruct(file);

      for (const deconstructedFile of deconstructedFiles) {
        yield deconstructedFile;
      }
    }
  }
};
