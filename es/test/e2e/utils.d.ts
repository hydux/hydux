/// <reference types="node" />
import * as puppeteer from 'puppeteer';
import * as child from 'child_process';
export declare const IsCI: boolean;
export declare const Examples: string;
export declare const timeout: number;
export declare const runServer: (app: string, port: number) => Promise<child.ChildProcess>;
export declare function downloadChrome(): Promise<void>;
export declare const sleep: (ms: number) => Promise<{}>;
export declare const launchBrowser: () => Promise<puppeteer.Browser>;
export declare const text: (e: puppeteer.ElementHandle, trim?: boolean) => Promise<any>;
export declare const counterSuit: (page: puppeteer.Page, n?: number, init?: number) => Promise<void>;
