ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'org_isolation_clients') THEN
    CREATE POLICY org_isolation_clients ON clients
      USING (organization_id = current_setting('app.current_org_id', true)::int);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'org_isolation_assessments') THEN
    CREATE POLICY org_isolation_assessments ON assessments
      USING (client_id IN (SELECT id FROM clients WHERE organization_id = current_setting('app.current_org_id', true)::int));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'org_isolation_answers') THEN
    CREATE POLICY org_isolation_answers ON answers
      USING (assessment_id IN (SELECT a.id FROM assessments a JOIN clients c ON a.client_id=c.id WHERE c.organization_id = current_setting('app.current_org_id', true)::int));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'org_isolation_policies') THEN
    CREATE POLICY org_isolation_policies ON policies
      USING (client_id IN (SELECT id FROM clients WHERE organization_id = current_setting('app.current_org_id', true)::int));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'org_isolation_reports') THEN
    CREATE POLICY org_isolation_reports ON reports
      USING (client_id IN (SELECT id FROM clients WHERE organization_id = current_setting('app.current_org_id', true)::int));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'org_isolation_evidence') THEN
    CREATE POLICY org_isolation_evidence ON evidence
      USING (client_id IN (SELECT id FROM clients WHERE organization_id = current_setting('app.current_org_id', true)::int));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'org_isolation_tasks') THEN
    CREATE POLICY org_isolation_tasks ON tasks
      USING (client_id IN (SELECT id FROM clients WHERE organization_id = current_setting('app.current_org_id', true)::int));
  END IF;
END $$;
