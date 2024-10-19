import type {
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

export const siteConfig: SiteConfig = {
  title: 'qian',
  subtitle: 'qian blog',
  lang: 'en',         // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko'
  themeColor: {
    hue: 250,         // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
    fixed: false,     // Hide the theme color picker for visitors
  },
  banner: {
    enable: false,
    src: 'assets/images/demo-banner.png',   // Relative to the /src directory. Relative to the /public directory if it starts with '/'
    position: 'center',      // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
    credit: {
      enable: false,         // Display the credit text of the banner image
      text: '',              // Credit text to be displayed
      url: ''                // (Optional) URL link to the original artwork or artist's page
    }
  },
  favicon: [    // Leave this array empty to use the default favicon
    {
       src: '/src/assets/images/me.png',    // Path of the favicon, relative to the /public directory
       theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
       sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
    }
  ]
}

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    {
      name: '友站',
      url: '/friends/'
    },
    // {
    //   // name: 'GitHub',
    //   // url: 'https://github.com/saicaca/fuwari',     // Internal links should not include the base path, as it is automatically added
    //   // external: true,                               // Show an external link icon and will open in a new tab
    // },
  ],
}

export const profileConfig: ProfileConfig = {
  avatar: 'assets/images/me.png',  // Relative to the /src directory. Relative to the /public directory if it starts with '/'
  name: 'qian',
  bio: '我想不到要寫啥',
  links: [
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/qian403',
    },
    {
      name:'Telegram',
      icon: 'fa6-brands:telegram',
      url: 'https://t.me/qian50',
    }
  ],
}

export const licenseConfig: LicenseConfig = {
  enable: false,
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}
