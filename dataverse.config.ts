export const config = {
  name: "faust", // app name should NOT contain "-"
  logo: "https://www.dustloop.com/wiki/images/0/02/GGST_Faust_5K.png",
  website: [], // you can use localhost:(port) for testing
  defaultFolderName: "Main",
  description: "This is dataverse app example.",
  models: [
    {
      isPublicDomain: false, // default
      schemaName: "post.graphql",
      encryptable: ["text", "images", "videos"], // strings within the schema and within the array represent fields that may be encrypted, while fields within the schema but not within the array represent fields that will definitely not be encrypted
    },
    {
      isPublicDomain: true,
      schemaName: "profile.graphql",
      encryptable: [],
    },
  ],
  ceramicUrl: null, // leave null to use dataverse test Ceramic node. Set to {Your Ceramic node Url} for mainnet, should start with "https://".
};
