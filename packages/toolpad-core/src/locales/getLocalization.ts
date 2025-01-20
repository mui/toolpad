import type { LocaleText } from '../AppProvider';

export const getLocalization = (translations: Partial<LocaleText>) => {
  return {
    components: {
      MuiLocalizationProvider: {
        defaultProps: {
          localeText: { ...translations },
        },
      },
    },
  };
};
