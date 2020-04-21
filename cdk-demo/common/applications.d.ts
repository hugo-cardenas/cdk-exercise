export declare const organizations: "GalacticEmpire"[];
export declare type Organization = typeof organizations[number];
declare const applications: ("DeathStar" | "DeathStarServerless")[];
export declare type ApplicationId = typeof applications[number];
export interface ApplicationConfig {
    path: string;
}
export declare const applicationConfigs: {
    [key in ApplicationId]: ApplicationConfig;
};
export {};
