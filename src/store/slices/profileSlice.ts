import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  completion: number;
  skills: string[];
  documents: { id: string; name: string }[];
  insights: string[];
}

const initialState: ProfileState = {
  completion: 60,
  skills: ['React Native', 'TypeScript', 'AI Collaboration'],
  documents: [{ id: 'cv', name: 'CV_Passionfruit.pdf' }],
  insights: ['Add more AI projects to boost match by 10%'],
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    addSkill: (state, action: PayloadAction<string>) => {
      state.skills.push(action.payload);
    },
    removeSkill: (state, action: PayloadAction<string>) => {
      state.skills = state.skills.filter((skill) => skill !== action.payload);
    },
    addDocument: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      state.documents.push(action.payload);
    },
    setCompletion: (state, action: PayloadAction<number>) => {
      state.completion = action.payload;
    },
    addInsight: (state, action: PayloadAction<string>) => {
      state.insights.push(action.payload);
    },
  },
});

export const { addSkill, removeSkill, addDocument, setCompletion, addInsight } = profileSlice.actions;

export default profileSlice.reducer;
