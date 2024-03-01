import { Encoding } from "./encoding";
export declare class Json implements Encoding {
    encode(data: any): any;
    decode(buff: any): any;
}
