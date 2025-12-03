import React from 'react';
import { SafeAreaView } from 'react-native';
import { Searchbar, Chip } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { JobCard } from '@/components/cards/JobCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilters, toggleSavedJob } from '@/store/slices/jobsSlice';
import { Job } from '@/types';
import { useGetJobsQuery } from '@/store/api/apiSlice';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const chips = ['Remote', 'Hybrid', 'On-site'];

const JobSearchScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector((state) => state.jobs.list);
  const filters = useAppSelector((state) => state.jobs.filters);
  const { refetch, isFetching } = useGetJobsQuery();
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    return jobs.filter((job) => {
      const matchesQuery = job.title.toLowerCase().includes(query.toLowerCase());
      const matchesLocation = filters.location ? job.location.includes(filters.location) : true;
      const matchesType = filters.type ? job.type.includes(filters.type) : true;
      return matchesQuery && matchesLocation && matchesType;
    });
  }, [jobs, query, filters]);

  const onToggleChip = (chip: string) => {
    dispatch(setFilters({ type: filters.type === chip ? undefined : chip }));
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Searchbar
        placeholder="Search roles, companies, keywords"
        value={query}
        onChangeText={setQuery}
        style={{ marginBottom: 12 }}
      />
      <SafeAreaView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {chips.map((chip) => (
          <Chip key={chip} selected={filters.type === chip} onPress={() => onToggleChip(chip)}>
            {chip}
          </Chip>
        ))}
      </SafeAreaView>
      {isFetching && !jobs.length ? (
        <LoadingSpinner />
      ) : (
        <FlashList
          data={filtered}
          renderItem={({ item }: { item: Job }) => (
            <JobCard
              job={item}
              onApply={() => {}}
              onSave={() => dispatch(toggleSavedJob(item.id))}
            />
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={280}
          refreshing={isFetching}
          onRefresh={refetch}
        />
      )}
    </SafeAreaView>
  );
};

export default JobSearchScreen;
