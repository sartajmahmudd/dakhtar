import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import type { RouterOutputs } from "@dakthar/api";
import { uploadToUserStore } from "@dakthar/firekit-client";

import { Loader } from "~/components/loader/Loader";
import { api } from "~/utils/api";

type BasicProfileInfoProps = RouterOutputs["doctor"]["getById"]["basicInfo"];
type metadata = RouterOutputs["doctor"]["getById"]["metadata"];

interface ApppointmentInformationProps {
  metadata: metadata;
}

const BasicProfileInfo = (props: BasicProfileInfoProps) => {
  const {
    register,
    handleSubmit,
    // watch,
    // formState: {
    //    errors
    // },
  } = useForm();

  const onSubmit = () => console.log("hello");

  return (
    <form className="form-control mx-24" onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="name" className="label">
        Name
      </label>
      <input
        id="name"
        type="text"
        placeholder="Name"
        className="input input-bordered"
        defaultValue={props.name}
        {...register("name", { required: true })}
      />
      <label htmlFor="email" className="label">
        Email
      </label>
      <input
        id="email"
        type="email"
        placeholder="Email"
        className="input input-bordered"
        defaultValue={props.email}
        {...register("email")}
      />
      <label htmlFor="gender" className="label">
        Gender
      </label>
      <input
        type="text"
        id="gender"
        defaultValue={props.gender}
        className="input input-bordered"
        disabled
      />

      <label htmlFor="phone" className="label">
        Phone
      </label>
      <input
        id="phone"
        type="text"
        placeholder="Phone"
        className="input input-bordered"
        defaultValue={props.phone}
        disabled
      // {...register("phone")}
      />
      <label htmlFor="verified" className="label">
        Verification Status
      </label>
      <select
        id="verified"
        className={"w-full max-w-xs rounded-md bg-[#f7f7f7] p-[14px]"}
        defaultValue={props.verified ? "VERIFIED" : "UNVERIFIED"}
        {...register("verified", {
          setValueAs: (value) => (value === "VERIFIED" ? true : false),
        })}
      >
        <option value="VERIFIED">Verified</option>
        <option value="UNVERIFIED">Unverified</option>
      </select>
      <label htmlFor="onboarding" className="label">
        Onboarding Status
      </label>
      <input
        type="text"
        name="onboarding"
        id="onboarding"
        className="input input-bordered"
        defaultValue={props.onboarding}
        disabled
      />
      <label htmlFor="bio" className="label">
        Bio
      </label>
      <textarea
        id="bio"
        className="textarea textarea-bordered"
        defaultValue={props.bio}
        {...register("bio")}
      />
      <label htmlFor="specialities" className="label">
        Specialities
      </label>
      <div>
        {props.specialities.map((speciality) => (
          <span key={speciality.slug} className="badge badge-primary mr-2">
            {speciality.name}
          </span>
        ))}
      </div>
      <input type="submit" value="Submit" className="btn btn-primary mt-8" />
    </form>
  );
};

const ApppointmentInformation = (props: ApppointmentInformationProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {props.metadata.map((meta, idx) => (
        <div key={idx} className="card bg-base-100 w-96 shadow-xl">
          <div className="card-body">
            <form className="form-control">
              <label htmlFor="location" className="label">
                Location
              </label>
              <textarea
                id="location"
                className="textarea textarea-bordered"
                defaultValue={meta.location}
              />
              <label htmlFor="consultationFee" className="label">
                Consultation Fee
              </label>
              <input
                type="number"
                id="consultationFee"
                className="input input-bordered"
                defaultValue={meta.consultationFee}
              />
              <label htmlFor="followUpFee" className="label">
                Follow Up Fee
              </label>
              <input
                type="number"
                id="followUpFee"
                className="input input-bordered"
                defaultValue={meta.followUpFee}
              />
              <label htmlFor="showReportFee" className="label">
                Show Report Fee
              </label>
              <input
                type="number"
                id="showReportFee"
                className="input input-bordered"
                defaultValue={meta.showReportFee}
              />
              <label htmlFor="followUpFeeValidity" className="label">
                Follow Up Fee Validity
              </label>
              <input
                type="number"
                id="followUpFeeValidity"
                className="input input-bordered"
                defaultValue={meta.followUpFeeValidity ?? 0}
              />
              <label htmlFor="showReportFeeValidity" className="label">
                Show Report Fee Validity
              </label>
              <input
                type="number"
                id="showReportFeeValidity"
                className="input input-bordered"
                defaultValue={meta.showReportFeeValidity ?? 0}
              />
              <div>
                {meta.availabilities.map((availability, idx) => (
                  <div
                    key={idx}
                    className="mx-auto flex flex-wrap justify-start gap-6"
                  >
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex gap-16">
                        <div className="flex flex-col gap-2">
                          <label
                            className="label label-text text-center text-sm"
                            htmlFor="startHour"
                          >
                            Start Time
                          </label>
                          <input
                            type="time"
                            id="startHour"
                            defaultValue={availability.startHour}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label
                            className="label label-text text-center text-sm"
                            htmlFor="endHour"
                          >
                            End Time
                          </label>
                          <input
                            type="time"
                            id="endHour"
                            defaultValue={availability.endHour}
                          />
                        </div>
                      </div>
                      <label htmlFor="day" className="label">
                        Day
                      </label>
                      <div>
                        {availability.days.map((day, idx) => (
                          <span key={idx} className="badge badge-primary mr-2">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </form>

            <div className="card-actions justify-end">
              <button className="btn btn-primary">Update</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const UpdateProfilePicture = () => {
  const router = useRouter();
  const id = Number(router.query.id);
  const uploadImage = api.doctor.updateProfilePictureById.useMutation();

  const upload = async (file: File) => {
    const fileName = file.name + uuidv4();
    const url = await uploadToUserStore(fileName, file);
    uploadImage.mutate({ id, url });
  };

  return (
    <section>
      <input
        className="file-input"
        type="file"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            await upload(file);
          }
        }}
      />
      {uploadImage.isLoading && <span className="loading" />}
    </section>
  );
};

const Doctor = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const doctor = api.doctor.getById.useQuery(
    { id: Number(id) },
    {
      enabled: !!id,
    },
  );

  if (doctor.isLoading) {
    return <Loader />;
  }

  if (doctor.isError) {
    return <div>Error: {doctor.error.message}</div>;
  }

  return (
    <section>
      <Head>
        <title>Doctor {id} - Dakthar.com</title>
        <meta name="description" content="Generated by create-t3-app" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-[20px] mt-5 lg:mx-[90px] lg:mt-10 ">
        <h1>Doctor {id}</h1>
        <UpdateProfilePicture />
        {/* <pre>{JSON.stringify(doctor.data.rawData, null, 2)}</pre> */}
        <section className="mt-24">
          <BasicProfileInfo {...doctor.data.basicInfo} />
        </section>
        <section className="mt-24">
          <ApppointmentInformation metadata={doctor.data.metadata} />
        </section>
      </div>
    </section>
  );
};

export default Doctor;
