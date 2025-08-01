import { createListenerMiddleware, ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { setExperiences } from './portfolioSlice';
import { IExperience } from './portfolioTypes';

export const portfolioListenerMiddleware = createListenerMiddleware();

export const initializePortfolioLanguageListener = (
  setLanguageAction: ActionCreatorWithPayload<'en' | 'pt', string>, 
  portfolioData: { en: IExperience[], pt: IExperience[] }
) => {
  portfolioListenerMiddleware.startListening({
    actionCreator: setLanguageAction,
    effect: async (action, listenerApi) => {
      const language = action.payload;
      
      const experiences = language === 'pt' ? portfolioData.pt : portfolioData.en;
      
      listenerApi.dispatch(setExperiences(experiences));
    },
  });
};
