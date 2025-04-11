import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zchhrvayusmdysjvjylv.supabase.co/";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaGhydmF5dXNtZHlzanZqeWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODMyNTIsImV4cCI6MjA1OTk1OTI1Mn0.7xRKisFUzjLdQLk7k0LxIHSi1YaL_mK2LK_f1Yps9vo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
