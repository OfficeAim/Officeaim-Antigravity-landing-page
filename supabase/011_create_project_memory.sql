-- Create Project Memory Table
create table if not exists project_memory (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    agent_name text not null,
    title text not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security
alter table project_memory enable row level security;

-- Policies
create policy "Users can view their own saved projects"
    on project_memory for select
    using ( auth.uid() = user_id );

create policy "Users can insert their own saved projects"
    on project_memory for insert
    with check ( auth.uid() = user_id );

create policy "Users can update their own saved projects"
    on project_memory for update
    using ( auth.uid() = user_id );

create policy "Users can delete their own saved projects"
    on project_memory for delete
    using ( auth.uid() = user_id );
