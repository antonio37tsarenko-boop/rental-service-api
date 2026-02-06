import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class TrimPipe implements PipeTransform {
  private readonly MAX_DEPTH = 10;

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== "body" || !this.isObject(value)) {
      return value;
    }

    return this.trimData(value);
  }

  private trimData(data: any, depth = 0): any {
    if (depth > this.MAX_DEPTH) {
      throw new BadRequestException("Request body depth exceeded limit");
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.trimData(item, depth + 1));
    }

    if (this.isObject(data)) {
      const trimmedObject: Record<string, any> = {};

      Object.keys(data).forEach((key) => {
        trimmedObject[key] = this.trimData(data[key], depth + 1);
      });

      return trimmedObject;
    }

    if (typeof data === "string") {
      return data.trim();
    }

    return data;
  }

  private isObject(obj: any): boolean {
    return (
      obj !== null &&
      typeof obj === "object" &&
      Object.prototype.toString.call(obj) === "[object Object]"
    );
  }
}
