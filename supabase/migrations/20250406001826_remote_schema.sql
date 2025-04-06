revoke delete on table "public"."game_history" from "anon";

revoke insert on table "public"."game_history" from "anon";

revoke references on table "public"."game_history" from "anon";

revoke select on table "public"."game_history" from "anon";

revoke trigger on table "public"."game_history" from "anon";

revoke truncate on table "public"."game_history" from "anon";

revoke update on table "public"."game_history" from "anon";

revoke delete on table "public"."game_history" from "authenticated";

revoke insert on table "public"."game_history" from "authenticated";

revoke references on table "public"."game_history" from "authenticated";

revoke select on table "public"."game_history" from "authenticated";

revoke trigger on table "public"."game_history" from "authenticated";

revoke truncate on table "public"."game_history" from "authenticated";

revoke update on table "public"."game_history" from "authenticated";

revoke delete on table "public"."game_history" from "service_role";

revoke insert on table "public"."game_history" from "service_role";

revoke references on table "public"."game_history" from "service_role";

revoke select on table "public"."game_history" from "service_role";

revoke trigger on table "public"."game_history" from "service_role";

revoke truncate on table "public"."game_history" from "service_role";

revoke update on table "public"."game_history" from "service_role";

revoke delete on table "public"."locations" from "anon";

revoke insert on table "public"."locations" from "anon";

revoke references on table "public"."locations" from "anon";

revoke select on table "public"."locations" from "anon";

revoke trigger on table "public"."locations" from "anon";

revoke truncate on table "public"."locations" from "anon";

revoke update on table "public"."locations" from "anon";

revoke delete on table "public"."locations" from "authenticated";

revoke insert on table "public"."locations" from "authenticated";

revoke references on table "public"."locations" from "authenticated";

revoke select on table "public"."locations" from "authenticated";

revoke trigger on table "public"."locations" from "authenticated";

revoke truncate on table "public"."locations" from "authenticated";

revoke update on table "public"."locations" from "authenticated";

revoke delete on table "public"."locations" from "service_role";

revoke insert on table "public"."locations" from "service_role";

revoke references on table "public"."locations" from "service_role";

revoke select on table "public"."locations" from "service_role";

revoke trigger on table "public"."locations" from "service_role";

revoke truncate on table "public"."locations" from "service_role";

revoke update on table "public"."locations" from "service_role";

revoke delete on table "public"."membership_plans" from "anon";

revoke insert on table "public"."membership_plans" from "anon";

revoke references on table "public"."membership_plans" from "anon";

revoke select on table "public"."membership_plans" from "anon";

revoke trigger on table "public"."membership_plans" from "anon";

revoke truncate on table "public"."membership_plans" from "anon";

revoke update on table "public"."membership_plans" from "anon";

revoke delete on table "public"."membership_plans" from "authenticated";

revoke insert on table "public"."membership_plans" from "authenticated";

revoke references on table "public"."membership_plans" from "authenticated";

revoke select on table "public"."membership_plans" from "authenticated";

revoke trigger on table "public"."membership_plans" from "authenticated";

revoke truncate on table "public"."membership_plans" from "authenticated";

revoke update on table "public"."membership_plans" from "authenticated";

revoke delete on table "public"."membership_plans" from "service_role";

revoke insert on table "public"."membership_plans" from "service_role";

revoke references on table "public"."membership_plans" from "service_role";

revoke select on table "public"."membership_plans" from "service_role";

revoke trigger on table "public"."membership_plans" from "service_role";

revoke truncate on table "public"."membership_plans" from "service_role";

revoke update on table "public"."membership_plans" from "service_role";

alter table "public"."game_history" drop constraint "game_history_result_check";

alter table "public"."game_history" drop constraint "game_history_user_id_fkey";

alter table "public"."membership_plans" drop constraint "membership_plans_tier_check";

alter table "public"."users" drop constraint "users_membership_tier_check";

alter table "public"."users" drop constraint "users_preferred_play_style_check";

alter table "public"."users" drop constraint "users_status_check";

alter table "public"."users" drop constraint "users_visibility_check";

alter table "public"."game_history" drop constraint "game_history_pkey";

alter table "public"."locations" drop constraint "locations_pkey";

alter table "public"."membership_plans" drop constraint "membership_plans_pkey";

drop index if exists "public"."game_history_pkey";

drop index if exists "public"."locations_pkey";

drop index if exists "public"."membership_plans_pkey";

drop table "public"."game_history";

drop table "public"."locations";

drop table "public"."membership_plans";

alter table "public"."users" drop column "availability";

alter table "public"."users" drop column "avatar_url";

alter table "public"."users" drop column "bio";

alter table "public"."users" drop column "display_name";

alter table "public"."users" drop column "last_active";

alter table "public"."users" drop column "membership_end_date";

alter table "public"."users" drop column "membership_start_date";

alter table "public"."users" drop column "membership_tier";

alter table "public"."users" drop column "playing_experience";

alter table "public"."users" drop column "preferences";

alter table "public"."users" drop column "preferred_play_style";

alter table "public"."users" drop column "privacy_policy_accepted";

alter table "public"."users" drop column "privacy_policy_accepted_at";

alter table "public"."users" drop column "stats";

alter table "public"."users" drop column "status";

alter table "public"."users" drop column "terms_accepted";

alter table "public"."users" drop column "terms_accepted_at";

alter table "public"."users" drop column "visibility";

alter table "public"."users" drop column "waiver_accepted";

alter table "public"."users" drop column "waiver_signed_at";


